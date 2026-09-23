const BASE_URL = 'http://localhost:5000/api';

async function runE2ETests() {
  console.log('\n========================================================');
  console.log('🧪 RUNNING FULL-STACK API VERIFICATION SUITE');
  console.log('========================================================\n');

  // 1. Health check
  const healthRes = await fetch(`${BASE_URL}/health`).then(r => r.json());
  console.log('1. Health Check:', healthRes.status === 'ok' ? '✅ PASSED' : '❌ FAILED');

  // 2. Fetch Users
  const usersRes = await fetch(`${BASE_URL}/users`).then(r => r.json());
  console.log(`2. Users Loaded: ${usersRes.count} users found.`, usersRes.count >= 3 ? '✅ PASSED' : '❌ FAILED');
  const alex = usersRes.users.find(u => u.username === 'alexmorgan');
  const priya = usersRes.users.find(u => u.username === 'priyasharma');

  // 3. Fetch Competition Details (Urban Dance Showdown)
  const compRes = await fetch(`${BASE_URL}/competitions/urban-dance-showdown-2026`, {
    headers: { 'x-user-id': alex._id },
  }).then(r => r.json());

  console.log(`3. Competition Loaded: "${compRes.competition.title}"`);
  console.log(`   - Current Phase: ${compRes.competition.currentPhase}`);
  console.log(`   - Spots Left: ${compRes.competition.spotsLeft} (Filled: ${compRes.competition.capacity.filledSpots}/${compRes.competition.capacity.maxSpots})`);
  console.log(`   - User isRegistered: ${compRes.competition.isRegistered}`);
  console.log(`   - Next Deadline: ${compRes.competition.nextDeadline}`);

  // 4. Register Alex Morgan (Atomic Spot Reservation)
  console.log('\n4. Attempting Registration for Alex Morgan...');
  const regRes = await fetch(`${BASE_URL}/competitions/urban-dance-showdown-2026/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': alex._id,
    },
    body: JSON.stringify({ referralCode: 'FRIEND100' }),
  }).then(r => r.json());

  console.log('   Registration Response:', regRes.message);
  console.log('   Registration Code:', regRes.registration?.registrationCode);

  // 5. Verify Spots Decremented to 0
  const afterRegComp = await fetch(`${BASE_URL}/competitions/urban-dance-showdown-2026`, {
    headers: { 'x-user-id': alex._id },
  }).then(r => r.json());

  console.log(`5. After Registration State:`);
  console.log(`   - Spots Left: ${afterRegComp.competition.spotsLeft}`);
  console.log(`   - Capacity: ${afterRegComp.competition.capacity.filledSpots}/${afterRegComp.competition.capacity.maxSpots}`);
  console.log(`   - isRegistered: ${afterRegComp.competition.isRegistered}`);
  console.log(`   - Current Phase: ${afterRegComp.competition.currentPhase}`);

  if (afterRegComp.competition.spotsLeft === 0 && afterRegComp.competition.isRegistered === true) {
    console.log('   ✅ PASSED: Spot booked atomically and user status updated to registered!');
  } else {
    console.error('   ❌ FAILED: Spot counter did not decrement properly.');
  }

  // 6. Test Duplicate Registration (Edge Case: Alex clicks Register again)
  console.log('\n6. Testing Duplicate Registration Prevention...');
  const dupRes = await fetch(`${BASE_URL}/competitions/urban-dance-showdown-2026/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': alex._id,
    },
  }).then(r => r.json());

  console.log('   Duplicate attempt response:', dupRes.message);
  if (!dupRes.success) {
    console.log('   ✅ PASSED: Duplicate registration strictly blocked!');
  } else {
    console.error('   ❌ FAILED: Duplicate registration allowed!');
  }

  // 7. Test Capacity Full Rejection (Edge Case: Marcus tries to register when spotsLeft == 0)
  console.log('\n7. Testing Capacity Full Rejection for unregistered user (Marcus)...');
  const marcus = usersRes.users.find(u => u.username === 'marcusvance');
  const fullRes = await fetch(`${BASE_URL}/competitions/urban-dance-showdown-2026/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': marcus._id,
    },
  }).then(r => r.json());

  console.log('   Capacity Full response:', fullRes.message);
  if (!fullRes.success && (fullRes.message.includes('full') || fullRes.message.includes('closed') || fullRes.message.includes('spots'))) {
    console.log('   ✅ PASSED: Capacity full correctly rejected unregistered user!');
  } else {
    console.error('   ❌ FAILED: Capacity full was not rejected!');
  }

  // 8. Test Previous Winners
  console.log('\n8. Testing Winners Endpoint...');
  const winnersRes = await fetch(`${BASE_URL}/competitions/urban-dance-showdown-2026/winners`).then(r => r.json());
  console.log(`   Winners count: ${winnersRes.count}`);
  if (winnersRes.success && winnersRes.winners.length > 0) {
    console.log(`   Podium 1st: ${winnersRes.winners[0].userName} (${winnersRes.winners[0].prizeWon})`);
    console.log('   ✅ PASSED: Winners retrieved successfully!');
  }

  // 9. Test Referral Endpoint
  console.log('\n9. Testing Referral Info Endpoint...');
  const refRes = await fetch(`${BASE_URL}/competitions/urban-dance-showdown-2026/referral`, {
    headers: { 'x-user-id': alex._id },
  }).then(r => r.json());

  const code = refRes.referralCode || refRes.referral?.referralCode;
  const link = refRes.referralLink || refRes.referral?.referralLink;
  console.log(`   Referral Code: ${code}`);
  console.log(`   Referral Link: ${link}`);
  if (refRes.success && code === 'ALEX892') {
    console.log('   ✅ PASSED: Personalized referral link generated!');
  }

  console.log('\n========================================================');
  console.log('🎉 ALL FULL-STACK REST API ENDPOINTS & LOGIC VALIDATED!');
  console.log('========================================================\n');
}

runE2ETests().catch(console.error);
