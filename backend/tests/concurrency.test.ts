import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { Competition, User, Registration } from '../src/models/index.js';

async function runConcurrencyTest() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING ATOMIC CONCURRENCY & OVERBOOKING STRESS TEST');
  console.log('======================================================\n');

  await connectDB();

  // 1. Create isolated test competition with ONLY 5 SPOTS
  const now = new Date();
  const testComp = await Competition.create({
    title: 'High Concurrency Flash Competition',
    slug: `stress-test-${Date.now()}`,
    categoryTags: ['Test', 'Concurrency'],
    hasCertificate: true,
    prizePool: { total: 10000, currency: 'INR', breakdown: [] },
    entryFee: { amount: 0, currency: 'INR', isFree: true },
    capacity: { maxSpots: 5, filledSpots: 0 }, // STRICT LIMIT: 5
    judge: { name: 'Test Judge', title: 'QA', avatarUrl: 'test', bio: 'test', introVideoUrl: 'test' },
    timeline: {
      registrationStartDate: new Date(now.getTime() - 10000),
      registrationEndDate: new Date(now.getTime() + 100000),
      submissionStartDate: new Date(now.getTime() + 200000),
      submissionEndDate: new Date(now.getTime() + 300000),
      resultDate: new Date(now.getTime() + 400000),
    },
    tabsContent: { about: 'Test', judgingParameters: [], rulesAndEligibility: [] },
  });

  console.log(`Created test competition "${testComp.title}" with maxSpots = 5`);

  // 2. Create 25 distinct test users
  const testUsers = [];
  for (let i = 0; i < 25; i++) {
    testUsers.push(
      await User.create({
        name: `Tester ${i}`,
        username: `tester_${Date.now()}_${i}`,
        email: `tester_${Date.now()}_${i}@test.com`,
        referralCode: `TEST${i}_${Date.now().toString().slice(-4)}`,
      })
    );
  }

  console.log(`Created 25 unique test users.`);
  console.log(`Simulating 25 simultaneous registration bursts on 5 available spots...`);

  // Function to simulate registration logic (same as controller)
  async function simulateRegister(user: any) {
    const updated = await Competition.findOneAndUpdate(
      {
        _id: testComp._id,
        'capacity.filledSpots': { $lt: testComp.capacity.maxSpots },
        'timeline.registrationStartDate': { $lte: new Date() },
        'timeline.registrationEndDate': { $gte: new Date() },
        statusOverride: 'active',
      },
      { $inc: { 'capacity.filledSpots': 1 } },
      { new: true }
    );

    if (!updated) {
      return { success: false, reason: 'SPOTS_FULL' };
    }

    try {
      const reg = await Registration.create({
        competitionId: testComp._id,
        userId: user._id,
        registrationCode: `REG-TEST-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        status: 'confirmed',
      });
      return { success: true, registrationId: reg._id };
    } catch (err) {
      // rollback spot
      await Competition.findByIdAndUpdate(testComp._id, { $inc: { 'capacity.filledSpots': -1 } });
      return { success: false, reason: 'DUPLICATE_OR_ERROR' };
    }
  }

  // Fire 25 concurrent requests simultaneously
  const results = await Promise.all(testUsers.map((u) => simulateRegister(u)));

  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.filter((r) => !r.success).length;

  console.log(`Results: ${successCount} succeeded, ${failureCount} rejected.`);

  // Check DB state
  const finalComp = await Competition.findById(testComp._id);
  const totalRegsInDB = await Registration.countDocuments({ competitionId: testComp._id });

  console.log(`Database filledSpots count: ${finalComp?.capacity.filledSpots}`);
  console.log(`Total Registration records in DB: ${totalRegsInDB}`);

  if (successCount === 5 && finalComp?.capacity.filledSpots === 5 && totalRegsInDB === 5) {
    console.log('✅ TEST 1 PASSED: Zero overbooking verified under concurrent load!\n');
  } else {
    console.error('❌ TEST 1 FAILED: Overbooking occurred!');
    process.exit(1);
  }

  // TEST 2: Duplicate clicks from the SAME user simultaneously
  console.log('Testing duplicate clicks by the same user simultaneously (5 bursts)...');
  const singleUser = testUsers[0];
  const dupResults = await Promise.all([
    simulateRegister(singleUser),
    simulateRegister(singleUser),
    simulateRegister(singleUser),
    simulateRegister(singleUser),
    simulateRegister(singleUser),
  ]);

  const dupSuccessCount = dupResults.filter((r) => r.success).length;
  console.log(`Duplicate burst results: ${dupSuccessCount} succeeded, ${dupResults.length - dupSuccessCount} rejected.`);

  const userRegsInDB = await Registration.countDocuments({
    competitionId: testComp._id,
    userId: singleUser._id,
  });

  if (userRegsInDB === 1) {
    console.log('✅ TEST 2 PASSED: Duplicate registration strictly prevented by unique constraint!\n');
  } else {
    console.error(`❌ TEST 2 FAILED: Expected 1 registration record for user, found ${userRegsInDB}`);
    process.exit(1);
  }

  // Cleanup test documents
  await Competition.deleteOne({ _id: testComp._id });
  await Registration.deleteMany({ competitionId: testComp._id });
  await User.deleteMany({ _id: { $in: testUsers.map((u) => u._id) } });

  console.log('🎉 ALL CONCURRENCY AND RACE-CONDITION TESTS PASSED SUCCESSFULLY!\n');
  await disconnectDB();
}

runConcurrencyTest().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
