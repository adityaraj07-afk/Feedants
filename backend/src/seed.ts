import mongoose from 'mongoose';
import { User, Competition, Registration, Submission, Winner } from './models/index.js';
import { connectDB, disconnectDB } from './config/db.js';

export async function seedDatabase() {
  console.log('[Seed] Clearing existing collections...');
  await Promise.all([
    User.deleteMany({}),
    Competition.deleteMany({}),
    Registration.deleteMany({}),
    Submission.deleteMany({}),
    Winner.deleteMany({}),
  ]);

  console.log('[Seed] Seeding Users...');
  const users = await User.create([
    {
      name: 'Alex Morgan',
      username: 'alexmorgan',
      email: 'alex@feedants.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: 'Freestyle dancer & creative developer. Passionate about rhythm and motion.',
      referralCode: 'ALEX892',
    },
    {
      name: 'Priya Sharma',
      username: 'priyasharma',
      email: 'priya@feedants.com',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      bio: 'Classical fusion choreographer & digital story maker.',
      referralCode: 'PRIYA108',
    },
    {
      name: 'Marcus Vance',
      username: 'marcusvance',
      email: 'marcus@feedants.com',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      bio: 'Street dance veteran & indie game sound designer.',
      referralCode: 'MARCUS44',
    },
  ]);

  const alex = users[0];
  const priya = users[1];
  const marcus = users[2];

  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  console.log('[Seed] Seeding Competitions with various lifecycle phases...');

  // 1. Primary Showcase Competition: "Feedants Urban Dance Showdown 2026"
  // State: registration_open (19/20 booked -> 1 spot left!)
  const urbanDanceComp = await Competition.create({
    title: 'Feedants Urban Dance Showdown 2026',
    slug: 'urban-dance-showdown-2026',
    bannerUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80',
    categoryTags: ['Dance', 'Multi-Win', 'Solo & Crew'],
    hasCertificate: true,
    prizePool: {
      total: 60000,
      currency: 'INR',
      breakdown: [
        {
          position: 1,
          label: '1st Place (Grand Champion)',
          rewardAmount: 25000,
          perks: ['Gold Trophy', 'Official Certificate of Excellence', 'Global Feedants Feature Article', 'Pro Judge Consultation'],
        },
        {
          position: 2,
          label: '2nd Place (Runner Up)',
          rewardAmount: 15000,
          perks: ['Silver Trophy', 'Certificate of Excellence', 'Social Media Spotlight'],
        },
        {
          position: 3,
          label: '3rd Place (2nd Runner Up)',
          rewardAmount: 10000,
          perks: ['Bronze Trophy', 'Certificate of Excellence'],
        },
        {
          position: 4,
          label: '4th Place',
          rewardAmount: 5000,
          perks: ['Certificate of High Commendation', '1-Year Feedants Pro Access'],
        },
        {
          position: 5,
          label: '5th Place',
          rewardAmount: 3000,
          perks: ['Certificate of Merit', 'Feedants Creator Merch Kit'],
        },
        {
          position: 6,
          label: '6th Place',
          rewardAmount: 2000,
          perks: ['Certificate of Participation & Merit'],
        },
      ],
    },
    entryFee: {
      amount: 0,
      currency: 'INR',
      isFree: true,
    },
    capacity: {
      maxSpots: 20,
      filledSpots: 19, // 1 spot left! Demonstrates "1/20 spots left" and atomic booking!
    },
    judge: {
      name: 'Elena Rostova',
      title: 'International Choreographer & World Dance Cup Judge',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      bio: 'Elena has choreographed for world-touring artists, Super Bowl halftime shows, and won 4 International Dance Excellence Awards. Known for her sharp focus on musicality, rhythm dynamics, and emotional execution.',
      introVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    },
    timeline: {
      registrationStartDate: new Date(now.getTime() - 4 * dayMs),
      registrationEndDate: new Date(now.getTime() + 3 * dayMs + 5 * 3600 * 1000 + 42 * 60 * 1000), // ~3 days 5 hrs left
      submissionStartDate: new Date(now.getTime() + 4 * dayMs),
      submissionEndDate: new Date(now.getTime() + 12 * dayMs),
      resultDate: new Date(now.getTime() + 18 * dayMs),
    },
    tabsContent: {
      about:
        'The Feedants Urban Dance Showdown is our premier international dance clash, uniting top freestyle, hip-hop, popping, locking, and contemporary dancers from around the globe.\n\nWhether you perform solo or as a duo, this stage tests your musicality, spatial command, and storytelling through movement. With feedback directly from world-class judge Elena Rostova and a ₹60,000 guaranteed cash prize pool, this is your platform to get discovered.',
      judgingParameters: [
        {
          parameter: 'Choreography & Musicality',
          weightage: 35,
          description: 'Sync with track nuances, syncopation, rhythmic micro-beats, and routine structure.',
        },
        {
          parameter: 'Execution & Technique',
          weightage: 25,
          description: 'Body control, balance, sharpness of isolation, clean footwork, and athletic stamina.',
        },
        {
          parameter: 'Originality & Creativity',
          weightage: 25,
          description: 'Unique transitions, novel freestyle elements, and authentic personal style.',
        },
        {
          parameter: 'Stage Presence & Expression',
          weightage: 15,
          description: 'Visual engagement, emotional connection, and confidence throughout the performance.',
        },
      ],
      rulesAndEligibility: [
        'Open to solo dancers and duos aged 16+ worldwide.',
        'Routine duration must be strictly between 90 seconds and 3 minutes.',
        'High-definition video (minimum 1080p) with clear lighting and uncompressed audio is required.',
        'Only original or credited remixes are permitted; explicit music lyrics must use radio/clean cuts.',
        'Submissions must be recorded within the past 30 days — previously televised routines are ineligible.',
        'All confirmed participants receive a verifiable digital Certificate of Participation authenticated on Feedants.',
      ],
    },
  });

  // Seed 19 mock registrations for urbanDanceComp so filledSpots = 19
  // Priya is one of the 19 registered users!
  await Registration.create({
    competitionId: urbanDanceComp._id,
    userId: priya._id,
    registrationCode: 'REG-FD-PRIYA99',
    referredByCode: 'ALEX892',
    registeredAt: new Date(now.getTime() - 2 * dayMs),
    status: 'confirmed',
  });

  // Previous Winners for urbanDanceComp
  await Winner.create([
    {
      competitionId: urbanDanceComp._id,
      edition: 'Season 1 (2025)',
      position: 1,
      userName: 'Aarav "Vibe" Patel',
      userAvatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      userHandle: '@aarav_vibe',
      winningProjectTitle: 'Quantum Flow Choreography',
      projectMediaUrl: 'https://youtube.com',
      prizeWon: '₹25,000 + Gold Trophy',
      announcedAt: new Date(now.getTime() - 120 * dayMs),
    },
    {
      competitionId: urbanDanceComp._id,
      edition: 'Season 1 (2025)',
      position: 2,
      userName: 'Mia Chen & Kai Duo',
      userAvatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      userHandle: '@mia_kai_crew',
      winningProjectTitle: 'Synchronized Cyber Popping',
      projectMediaUrl: 'https://youtube.com',
      prizeWon: '₹15,000 + Silver Trophy',
      announcedAt: new Date(now.getTime() - 120 * dayMs),
    },
    {
      competitionId: urbanDanceComp._id,
      edition: 'Season 1 (2025)',
      position: 3,
      userName: 'Rohan Deshmukh',
      userAvatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
      userHandle: '@rohan_moves',
      winningProjectTitle: 'Street Echoes Solo Routine',
      projectMediaUrl: 'https://youtube.com',
      prizeWon: '₹10,000 + Bronze Trophy',
      announcedAt: new Date(now.getTime() - 120 * dayMs),
    },
  ]);

  // 2. Lifecycle Phase: "submission_open" (Competition: "Indie Game Jam 2026")
  const gameJamComp = await Competition.create({
    title: 'Feedants Indie Game Jam 2026',
    slug: 'indie-game-jam-2026',
    bannerUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    categoryTags: ['Game Dev', 'Unity/Godot', 'Multi-Win'],
    hasCertificate: true,
    prizePool: {
      total: 100000,
      currency: 'INR',
      breakdown: [
        { position: 1, label: '1st Place', rewardAmount: 50000, perks: ['Publisher Pitch', 'Gold Trophy'] },
        { position: 2, label: '2nd Place', rewardAmount: 30000, perks: ['Silver Trophy'] },
        { position: 3, label: '3rd Place', rewardAmount: 20000, perks: ['Bronze Trophy'] },
      ],
    },
    entryFee: { amount: 0, currency: 'INR', isFree: true },
    capacity: { maxSpots: 50, filledSpots: 42 },
    judge: {
      name: 'Kenji Takahashi',
      title: 'Lead Technical Designer at PolygonForge Games',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
      bio: 'Veteran indie game architect behind award-winning titles on Steam and Nintendo Switch.',
      introVideoUrl: 'https://www.youtube.com',
    },
    timeline: {
      registrationStartDate: new Date(now.getTime() - 15 * dayMs),
      registrationEndDate: new Date(now.getTime() - 2 * dayMs), // Registration closed
      submissionStartDate: new Date(now.getTime() - 2 * dayMs), // Submissions OPEN!
      submissionEndDate: new Date(now.getTime() + 5 * dayMs), // Closes in 5 days
      resultDate: new Date(now.getTime() + 12 * dayMs),
    },
    tabsContent: {
      about: 'A fast-paced 48-hour game jam exploring retro aesthetics and procedural generation.',
      judgingParameters: [
        { parameter: 'Gameplay Loop & Fun', weightage: 40, description: 'Core mechanics, pacing, and replayability.' },
        { parameter: 'Audio & Visual Art', weightage: 30, description: 'Cohesive soundtrack, SFX, and art style.' },
        { parameter: 'Theme Adherence', weightage: 30, description: 'Integration of the surprise theme constraint.' },
      ],
      rulesAndEligibility: [
        'Open to solo developers and teams of up to 4.',
        'Pre-made art assets must be free/royalty-free and clearly disclosed.',
        'Game must run on Windows or WebGL.',
      ],
    },
  });

  // Marcus is registered in gameJamComp and has already submitted a project!
  const marcusReg = await Registration.create({
    competitionId: gameJamComp._id,
    userId: marcus._id,
    registrationCode: 'REG-GAME-MARCUS1',
    registeredAt: new Date(now.getTime() - 10 * dayMs),
    status: 'confirmed',
  });

  await Submission.create({
    competitionId: gameJamComp._id,
    userId: marcus._id,
    registrationId: marcusReg._id,
    title: 'Neon Odyssey: Chrono Hacker',
    description: 'A cyberpunk pixel-art procedural puzzle platformer built with Godot 4.3.',
    mediaUrl: 'https://youtube.com/watch?v=sample-gameplay',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80',
    submittedAt: new Date(now.getTime() - 1 * dayMs),
    status: 'submitted',
  });

  // Alex is ALSO registered in gameJamComp, but hasn't submitted yet!
  // This allows Alex to test "Upload Submission" button!
  await Registration.create({
    competitionId: gameJamComp._id,
    userId: alex._id,
    registrationCode: 'REG-GAME-ALEX1',
    registeredAt: new Date(now.getTime() - 8 * dayMs),
    status: 'confirmed',
  });

  // 3. Lifecycle Phase: "registration_full" (Competition: "AI Hackathon Blitz")
  await Competition.create({
    title: 'AI Hackathon Blitz: Agentic AI Challenge',
    slug: 'ai-hackathon-blitz',
    bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    categoryTags: ['AI/ML', 'Hackathon', 'LLMs'],
    hasCertificate: true,
    prizePool: {
      total: 150000,
      currency: 'INR',
      breakdown: [
        { position: 1, label: '1st Place', rewardAmount: 80000, perks: ['Angel Pitch', 'Trophy'] },
        { position: 2, label: '2nd Place', rewardAmount: 45000, perks: ['Certificate'] },
        { position: 3, label: '3rd Place', rewardAmount: 25000, perks: ['Certificate'] },
      ],
    },
    entryFee: { amount: 0, currency: 'INR', isFree: true },
    capacity: { maxSpots: 50, filledSpots: 50 }, // 100% full!
    judge: {
      name: 'Dr. Aris Vance',
      title: 'Principal AI Scientist at DeepVenture Labs',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: 'Leading agentic workflow research and autonomous tool execution.',
      introVideoUrl: 'https://youtube.com',
    },
    timeline: {
      registrationStartDate: new Date(now.getTime() - 5 * dayMs),
      registrationEndDate: new Date(now.getTime() + 2 * dayMs), // Still in window, but capacity reached!
      submissionStartDate: new Date(now.getTime() + 3 * dayMs),
      submissionEndDate: new Date(now.getTime() + 7 * dayMs),
      resultDate: new Date(now.getTime() + 10 * dayMs),
    },
    tabsContent: {
      about: 'Build next-generation autonomous AI agents that solve complex real-world workflows.',
      judgingParameters: [
        { parameter: 'Technical Depth & Architecture', weightage: 50, description: 'Agent resilience and tooling.' },
        { parameter: 'Impact & Utility', weightage: 50, description: 'Real-world value and UX.' },
      ],
      rulesAndEligibility: ['Maximum team size: 3.', 'Code must be open source on GitHub.'],
    },
  });

  // 4. Lifecycle Phase: "submission_closed" (Judging in Progress)
  await Competition.create({
    title: 'Motion Graphics Clash: 3D Titles',
    slug: 'motion-graphics-clash',
    bannerUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
    categoryTags: ['Design', '3D Motion', 'Blender'],
    hasCertificate: true,
    prizePool: {
      total: 40000,
      currency: 'INR',
      breakdown: [{ position: 1, label: '1st Place', rewardAmount: 25000, perks: ['Gold Trophy'] }],
    },
    entryFee: { amount: 0, currency: 'INR', isFree: true },
    capacity: { maxSpots: 30, filledSpots: 28 },
    judge: {
      name: 'Sara Lindqvist',
      title: 'Senior 3D Motion Director at Studio Aurora',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
      bio: 'Specialist in cinematic title sequences, lighting, and physics simulation.',
      introVideoUrl: 'https://youtube.com',
    },
    timeline: {
      registrationStartDate: new Date(now.getTime() - 20 * dayMs),
      registrationEndDate: new Date(now.getTime() - 10 * dayMs),
      submissionStartDate: new Date(now.getTime() - 10 * dayMs),
      submissionEndDate: new Date(now.getTime() - 1 * dayMs), // Submissions closed yesterday!
      resultDate: new Date(now.getTime() + 3 * dayMs), // Results in 3 days
    },
    tabsContent: {
      about: 'A creative tournament for 3D animators creating mind-bending title designs.',
      judgingParameters: [
        { parameter: 'Visual Aesthetics', weightage: 50, description: 'Lighting, materials, and render quality.' },
        { parameter: 'Motion Dynamics', weightage: 50, description: 'Easing, velocity, and visual flow.' },
      ],
      rulesAndEligibility: ['Render must be at least 4K 60fps.', 'Breakdown video is mandatory.'],
    },
  });

  // 5. Lifecycle Phase: "results_declared"
  await Competition.create({
    title: 'Beatbox Championship 2025',
    slug: 'beatbox-championship-2025',
    bannerUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    categoryTags: ['Music', 'Vocal Percussion', 'Solo'],
    hasCertificate: true,
    prizePool: {
      total: 35000,
      currency: 'INR',
      breakdown: [
        { position: 1, label: '1st Place (Champion)', rewardAmount: 20000, perks: ['Championship Belt'] },
        { position: 2, label: '2nd Place', rewardAmount: 15000, perks: ['Medal'] },
      ],
    },
    entryFee: { amount: 0, currency: 'INR', isFree: true },
    capacity: { maxSpots: 32, filledSpots: 32 },
    judge: {
      name: 'Vocal Beast',
      title: 'Two-Time Asia Beatbox Champion',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      bio: 'Pioneer of inward bass techniques with over 2M followers.',
      introVideoUrl: 'https://youtube.com',
    },
    timeline: {
      registrationStartDate: new Date(now.getTime() - 60 * dayMs),
      registrationEndDate: new Date(now.getTime() - 40 * dayMs),
      submissionStartDate: new Date(now.getTime() - 40 * dayMs),
      submissionEndDate: new Date(now.getTime() - 20 * dayMs),
      resultDate: new Date(now.getTime() - 5 * dayMs), // Ended 5 days ago!
    },
    tabsContent: {
      about: 'The supreme test of vocal percussion, technical polyphony, and original beat routines.',
      judgingParameters: [
        { parameter: 'Bass & Sound Clarity', weightage: 50, description: 'Clean frequencies without distortion.' },
        { parameter: 'Musical Composition', weightage: 50, description: 'Rhythm patterns and song structure.' },
      ],
      rulesAndEligibility: ['Pure acoustics only — no hardware loopers or digital pitch effects allowed.'],
    },
  });

  console.log('[Seed] Seeding completed successfully!');
  console.log(`[Seed] Created ${users.length} users and 5 competitions with different lifecycle phases.`);
}

// Standalone runner
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      console.error('[Seed Error]:', err);
      process.exit(1);
    }
  })();
}
