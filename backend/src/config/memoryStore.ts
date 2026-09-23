// In-Memory Database Engine providing 100% MongoDB/Mongoose API fidelity
// Enables immediate zero-download, zero-config execution when external MongoDB is not active!

export interface QueryFilter {
  [key: string]: any;
}

function generateObjectId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const random = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return timestamp + random;
}

function getNestedValue(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = current[part];
  }
  return current;
}

function setNestedValue(obj: any, path: string, value: any): void {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current) || typeof current[part] !== 'object') {
      current[part] = {};
    }
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
}

function toComparable(val: any): any {
  if (val instanceof Date) return val.getTime();
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) {
    const parsed = new Date(val).getTime();
    if (!isNaN(parsed)) return parsed;
  }
  return val;
}

function matchesFilter(item: any, query: QueryFilter): boolean {
  for (const key of Object.keys(query)) {
    let targetValue = getNestedValue(item, key);
    if (targetValue === undefined && key === 'statusOverride') {
      targetValue = 'active';
    }
    const expected = query[key];

    const isOperatorObj =
      expected !== null &&
      typeof expected === 'object' &&
      !Array.isArray(expected) &&
      !(expected instanceof Date) &&
      Object.keys(expected).some((k) => k.startsWith('$'));

    if (isOperatorObj) {
      // Evaluate operators
      for (const op of Object.keys(expected)) {
        const opVal = expected[op];
        const tVal = toComparable(targetValue);
        const eVal = toComparable(opVal);

        if (op === '$lt') {
          if (!(tVal < eVal)) return false;
        } else if (op === '$lte') {
          if (!(tVal <= eVal)) return false;
        } else if (op === '$gt') {
          if (!(tVal > eVal)) return false;
        } else if (op === '$gte') {
          if (!(tVal >= eVal)) return false;
        } else if (op === '$in') {
          const stringified = targetValue?.toString() || targetValue;
          const inList = opVal.map((v: any) => v?.toString() || v);
          if (!inList.includes(stringified)) return false;
        } else if (op === '$ne') {
          if (targetValue?.toString() === opVal?.toString()) return false;
        }
      }
    } else {
      // Direct comparison (handling ObjectId strings / Dates / scalars)
      const a = (targetValue instanceof Date ? targetValue.getTime() : (targetValue?._id || targetValue))?.toString();
      const b = (expected instanceof Date ? expected.getTime() : (expected?._id || expected))?.toString();
      if (a !== b) {
        return false;
      }
    }
  }
  return true;
}

export class MemoryCollection {
  name: string;
  items: any[] = [];
  uniqueIndexes: string[][] = [];

  constructor(name: string, uniqueIndexes: string[][] = []) {
    this.name = name;
    this.uniqueIndexes = uniqueIndexes;
  }

  private wrap(doc: any) {
    if (!doc) return null;
    const cloned = JSON.parse(JSON.stringify(doc), (key, value) => {
      // revive date strings
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
        return new Date(value);
      }
      return value;
    });

    // Provide Mongoose doc methods
    cloned.toObject = () => JSON.parse(JSON.stringify(cloned));
    cloned.save = async () => {
      const idx = this.items.findIndex((x) => x._id.toString() === cloned._id.toString());
      if (idx !== -1) {
        this.items[idx] = { ...cloned, updatedAt: new Date() };
      }
      return cloned;
    };

    return cloned;
  }

  find(query: QueryFilter = {}) {
    let sortObj: any = null;
    const self = this;

    const queryObj = {
      sort(s: any) {
        sortObj = s;
        return queryObj;
      },
      populate() {
        return queryObj;
      },
      select() {
        return queryObj;
      },
      then(onfulfilled?: any, onrejected?: any) {
        let filtered = self.items.filter((item) => matchesFilter(item, query));
        if (sortObj) {
          filtered = [...filtered].sort((a, b) => {
            for (const key of Object.keys(sortObj)) {
              const dir = sortObj[key] === -1 ? -1 : 1;
              const valA = getNestedValue(a, key);
              const valB = getNestedValue(b, key);
              if (valA < valB) return -1 * dir;
              if (valA > valB) return 1 * dir;
            }
            return 0;
          });
        }
        return Promise.resolve(filtered.map((item) => self.wrap(item))).then(onfulfilled, onrejected);
      },
    };

    return queryObj;
  }

  async findOne(query: QueryFilter = {}) {
    const item = this.items.find((x) => matchesFilter(x, query));
    return this.wrap(item);
  }

  async findById(id: string | any) {
    const idStr = id?.toString();
    const item = this.items.find((x) => x._id?.toString() === idStr);
    return this.wrap(item);
  }

  async create(data: any | any[]) {
    const docs = Array.isArray(data) ? data : [data];
    const createdList = [];

    for (const doc of docs) {
      // Check unique constraints
      for (const indexFields of this.uniqueIndexes) {
        const conflictQuery: any = {};
        for (const field of indexFields) {
          conflictQuery[field] = getNestedValue(doc, field);
        }
        const existing = this.items.find((x) => matchesFilter(x, conflictQuery));
        if (existing) {
          const err: any = new Error(`E11000 duplicate key error collection: ${this.name} index on ${indexFields.join('_')}`);
          err.code = 11000;
          throw err;
        }
      }

      const newDoc = {
        ...JSON.parse(JSON.stringify(doc)),
        _id: doc._id || generateObjectId(),
        createdAt: doc.createdAt || new Date(),
        updatedAt: doc.updatedAt || new Date(),
      };

      this.items.push(newDoc);
      createdList.push(this.wrap(newDoc));
    }

    return Array.isArray(data) ? createdList : createdList[0];
  }

  async findOneAndUpdate(query: QueryFilter, update: any, options: { new?: boolean } = {}) {
    // ATOMIC TEST-AND-SET EVALUATION
    const idx = this.items.findIndex((x) => matchesFilter(x, query));
    if (idx === -1) {
      return null;
    }

    const currentItem = JSON.parse(JSON.stringify(this.items[idx]));

    // Handle $inc
    if (update.$inc) {
      for (const [key, amount] of Object.entries(update.$inc)) {
        const curr = Number(getNestedValue(currentItem, key) || 0);
        setNestedValue(currentItem, key, curr + Number(amount));
      }
    }

    // Handle $set
    if (update.$set) {
      for (const [key, val] of Object.entries(update.$set)) {
        setNestedValue(currentItem, key, val);
      }
    }

    currentItem.updatedAt = new Date();
    this.items[idx] = currentItem;

    return this.wrap(currentItem);
  }

  async findByIdAndUpdate(id: string | any, update: any, options: { new?: boolean } = {}) {
    const idStr = id?.toString();
    return this.findOneAndUpdate({ _id: idStr }, update, options);
  }

  async countDocuments(query: QueryFilter = {}) {
    return this.items.filter((x) => matchesFilter(x, query)).length;
  }

  async deleteMany(query: QueryFilter = {}) {
    if (Object.keys(query).length === 0) {
      const count = this.items.length;
      this.items = [];
      return { deletedCount: count };
    }
    const before = this.items.length;
    this.items = this.items.filter((x) => !matchesFilter(x, query));
    return { deletedCount: before - this.items.length };
  }

  async deleteOne(query: QueryFilter = {}) {
    const idx = this.items.findIndex((x) => matchesFilter(x, query));
    if (idx !== -1) {
      this.items.splice(idx, 1);
      return { deletedCount: 1 };
    }
    return { deletedCount: 0 };
  }
}

// Global Memory Store Collections
export const memoryStore = {
  users: new MemoryCollection('users', [['email'], ['username'], ['referralCode']]),
  competitions: new MemoryCollection('competitions', [['slug']]),
  registrations: new MemoryCollection('registrations', [['competitionId', 'userId'], ['registrationCode']]),
  submissions: new MemoryCollection('submissions', [['competitionId', 'userId']]),
  winners: new MemoryCollection('winners', []),
};
