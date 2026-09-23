import { User as MongoUser } from './User.js';
import type { IUser } from './User.js';
import { Competition as MongoCompetition } from './Competition.js';
import type { ICompetition } from './Competition.js';
import { Registration as MongoRegistration } from './Registration.js';
import type { IRegistration } from './Registration.js';
import { Submission as MongoSubmission } from './Submission.js';
import type { ISubmission } from './Submission.js';
import { Winner as MongoWinner } from './Winner.js';
import type { IWinner } from './Winner.js';
import { memoryStore } from '../config/memoryStore.js';
import { isMongoConnected } from '../config/db.js';

function createUnifiedModel(mongoModel: any, memoryCollection: any) {
  return new Proxy(mongoModel, {
    get(target, prop) {
      if (!isMongoConnected) {
        if (prop in memoryCollection) {
          const val = (memoryCollection as any)[prop];
          return typeof val === 'function' ? val.bind(memoryCollection) : val;
        }
      }
      return target[prop];
    },
  });
}

export const User = createUnifiedModel(MongoUser, memoryStore.users);
export const Competition = createUnifiedModel(MongoCompetition, memoryStore.competitions);
export const Registration = createUnifiedModel(MongoRegistration, memoryStore.registrations);
export const Submission = createUnifiedModel(MongoSubmission, memoryStore.submissions);
export const Winner = createUnifiedModel(MongoWinner, memoryStore.winners);

export type { IUser, ICompetition, IRegistration, ISubmission, IWinner };
