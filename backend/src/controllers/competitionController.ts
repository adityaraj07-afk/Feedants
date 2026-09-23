import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Competition, User, Registration, Submission, Winner } from '../models/index.js';
import { computeCompetitionLifecycle } from '../utils/lifecycle.js';

// Helper to extract userId from headers or query for seamless testing/auth
function getRequestUserId(req: Request): string | null {
  const headerUser = req.headers['x-user-id'];
  if (typeof headerUser === 'string' && headerUser.trim() !== '') {
    return headerUser.trim();
  }
  const queryUser = req.query.userId;
  if (typeof queryUser === 'string' && queryUser.trim() !== '') {
    return queryUser.trim();
  }
  return null;
}

function getParamId(req: Request): string {
  const param = req.params.id;
  if (Array.isArray(param)) return param[0] || '';
  return typeof param === 'string' ? param : '';
}

/**
 * GET /api/competitions
 * Returns list of all competitions with current lifecycle phase & spots
 */
export async function getCompetitions(req: Request, res: Response): Promise<void> {
  try {
    const userId = getRequestUserId(req);
    const competitions = await Competition.find().sort({ createdAt: -1 });

    // Optional user registration lookup
    let userRegistrations: string[] = [];
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      const regs = await Registration.find({ userId, status: 'confirmed' });
      userRegistrations = regs.map((r: any) => r.competitionId.toString());
    }

    const results = competitions.map((comp: any) => {
      const isRegistered = userRegistrations.includes(comp._id.toString());
      const lifecycle = computeCompetitionLifecycle(comp, { isRegistered });
      return {
        _id: comp._id,
        title: comp.title,
        slug: comp.slug,
        bannerUrl: comp.bannerUrl,
        categoryTags: comp.categoryTags,
        hasCertificate: comp.hasCertificate,
        prizePool: comp.prizePool,
        entryFee: comp.entryFee,
        capacity: comp.capacity,
        timeline: comp.timeline,
        judge: {
          name: comp.judge.name,
          title: comp.judge.title,
          avatarUrl: comp.judge.avatarUrl,
        },
        lifecycle,
      };
    });

    res.json({
      success: true,
      count: results.length,
      serverTime: new Date().toISOString(),
      competitions: results,
    });
  } catch (error: any) {
    console.error('Error fetching competitions:', error);
    res.status(500).json({ success: false, message: 'Server error fetching competitions', error: error.message });
  }
}

/**
 * GET /api/competitions/:id
 * Returns full competition details plus computed fields for requesting user
 */
export async function getCompetitionById(req: Request, res: Response): Promise<void> {
  try {
    const id = getParamId(req);
    const userId = getRequestUserId(req);

    // Support lookup by either ObjectId or slug!
    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { slug: id };
    const competition = await Competition.findOne(query);

    if (!competition) {
      res.status(404).json({ success: false, message: 'Competition not found' });
      return;
    }

    let isRegistered = false;
    let registrationDetails: any = null;
    let hasSubmitted = false;
    let submissionDetails: any = null;

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      const registration = await Registration.findOne({
        competitionId: competition._id,
        userId: new mongoose.Types.ObjectId(userId),
        status: 'confirmed',
      });

      if (registration) {
        isRegistered = true;
        registrationDetails = registration;

        const submission = await Submission.findOne({
          competitionId: competition._id,
          userId: new mongoose.Types.ObjectId(userId),
        });

        if (submission) {
          hasSubmitted = true;
          submissionDetails = submission;
        }
      }
    }

    const lifecycle = computeCompetitionLifecycle(competition, {
      isRegistered,
      hasSubmitted,
    });

    // Also get previous winners count
    const winnersCount = await Winner.countDocuments({ competitionId: competition._id });

    res.json({
      success: true,
      competition: {
        ...competition.toObject(),
        isRegistered,
        registrationDetails,
        hasSubmitted,
        submissionDetails,
        winnersCount,
        lifecycle,
        spotsLeft: lifecycle.spotsLeft,
        isSpotsFull: lifecycle.isSpotsFull,
        currentPhase: lifecycle.currentPhase,
        serverTime: lifecycle.serverTime,
        nextDeadline: lifecycle.nextDeadline,
        nextDeadlineLabel: lifecycle.nextDeadlineLabel,
        ctaText: lifecycle.ctaText,
        ctaAction: lifecycle.ctaAction,
      },
    });
  } catch (error: any) {
    console.error('Error fetching competition details:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
}

/**
 * POST /api/competitions/:id/register
 * Registers user with atomic, race-condition safe spot booking
 */
export async function registerForCompetition(req: Request, res: Response): Promise<void> {
  try {
    const id = getParamId(req);
    const userId = getRequestUserId(req);
    const { referralCode } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a valid user id via x-user-id header.',
      });
      return;
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Find competition
    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { slug: id };
    const competition = await Competition.findOne(query);

    if (!competition) {
      res.status(404).json({ success: false, message: 'Competition not found' });
      return;
    }

    const now = new Date();

    // Check 1: User duplicate registration check upfront
    const existingRegistration = await Registration.findOne({
      competitionId: competition._id,
      userId: user._id,
      status: 'confirmed',
    });

    if (existingRegistration) {
      res.status(409).json({
        success: false,
        message: 'You are already registered for this competition.',
        registration: existingRegistration,
      });
      return;
    }

    // Check 2: Timeline deadline checks (timezone-safe UTC comparison)
    if (now < competition.timeline.registrationStartDate) {
      res.status(400).json({
        success: false,
        message: `Registration has not opened yet. Registration opens on ${competition.timeline.registrationStartDate.toISOString()}`,
      });
      return;
    }

    if (now > competition.timeline.registrationEndDate) {
      res.status(400).json({
        success: false,
        message: `Registration deadline has passed on ${competition.timeline.registrationEndDate.toISOString()}. Registration is now closed.`,
      });
      return;
    }

    // CRITICAL: ATOMIC CONDITIONAL UPDATE FOR RACE-CONDITION SAFE SPOT RESERVATION
    // This atomic query guarantees no overbooking even with thousands of concurrent requests!
    const updatedCompetition = await Competition.findOneAndUpdate(
      {
        _id: competition._id,
        'capacity.filledSpots': { $lt: competition.capacity.maxSpots },
        'timeline.registrationStartDate': { $lte: now },
        'timeline.registrationEndDate': { $gte: now },
        statusOverride: 'active',
      },
      {
        $inc: { 'capacity.filledSpots': 1 },
      },
      {
        new: true,
      }
    );

    if (!updatedCompetition) {
      // Either spots filled up during race, or deadline passed in the exact millisecond
      res.status(400).json({
        success: false,
        message: 'Registration failed: All spots for this competition are full or registration has ended.',
      });
      return;
    }

    // Generate unique registration code: REG-<ALPHANUMERIC>
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const registrationCode = `REG-FD-${randomSuffix}`;

    try {
      const registration = await Registration.create({
        competitionId: competition._id,
        userId: user._id,
        registrationCode,
        referredByCode: referralCode ? referralCode.toString().trim().toUpperCase() : undefined,
        registeredAt: now,
        status: 'confirmed',
      });

      const spotsLeft = Math.max(0, updatedCompetition.capacity.maxSpots - updatedCompetition.capacity.filledSpots);

      res.status(201).json({
        success: true,
        message: 'Successfully registered for the competition!',
        registration,
        spotsLeft,
        filledSpots: updatedCompetition.capacity.filledSpots,
        maxSpots: updatedCompetition.capacity.maxSpots,
      });
    } catch (createError: any) {
      // COMPENSATION ROLLBACK: If Registration.create fails (e.g. duplicate key collision),
      // release the atomically incremented spot immediately!
      await Competition.findByIdAndUpdate(competition._id, {
        $inc: { 'capacity.filledSpots': -1 },
      });

      if (createError.code === 11000) {
        res.status(409).json({
          success: false,
          message: 'You are already registered for this competition (duplicate detected).',
        });
        return;
      }

      throw createError;
    }
  } catch (error: any) {
    console.error('Error during registration:', error);
    res.status(500).json({ success: false, message: 'Server error during registration', error: error.message });
  }
}

/**
 * POST /api/competitions/:id/submit
 * Uploads/records project submission with validation
 */
export async function submitProject(req: Request, res: Response): Promise<void> {
  try {
    const id = getParamId(req);
    const userId = getRequestUserId(req);
    const { title, description, mediaUrl, thumbnailUrl } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      res.status(401).json({ success: false, message: 'Authentication required. Provide valid x-user-id header.' });
      return;
    }

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      res.status(400).json({ success: false, message: 'Submission title is required.' });
      return;
    }

    if (!mediaUrl || typeof mediaUrl !== 'string' || mediaUrl.trim().length === 0) {
      res.status(400).json({ success: false, message: 'Media/Demo URL is required.' });
      return;
    }

    // Basic URL validation
    try {
      new URL(mediaUrl);
    } catch {
      res.status(400).json({ success: false, message: 'Please provide a valid media URL (http/https).' });
      return;
    }

    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { slug: id };
    const competition = await Competition.findOne(query);

    if (!competition) {
      res.status(404).json({ success: false, message: 'Competition not found' });
      return;
    }

    // Validation 1: User must be registered
    const registration = await Registration.findOne({
      competitionId: competition._id,
      userId: new mongoose.Types.ObjectId(userId),
      status: 'confirmed',
    });

    if (!registration) {
      res.status(403).json({
        success: false,
        message: 'You must be registered for this competition before you can submit a project.',
      });
      return;
    }

    // Validation 2: Timezone-safe submission window check
    const now = new Date();
    if (now < competition.timeline.submissionStartDate) {
      res.status(400).json({
        success: false,
        message: `Submissions are not open yet. Submissions open on ${competition.timeline.submissionStartDate.toISOString()}`,
      });
      return;
    }

    if (now > competition.timeline.submissionEndDate) {
      res.status(400).json({
        success: false,
        message: `Submission deadline has passed on ${competition.timeline.submissionEndDate.toISOString()}. Submissions are closed.`,
      });
      return;
    }

    // Create or update submission
    const existingSubmission = await Submission.findOne({
      competitionId: competition._id,
      userId: new mongoose.Types.ObjectId(userId),
    });

    let submission;
    if (existingSubmission) {
      existingSubmission.title = title.trim();
      existingSubmission.description = description ? description.trim() : '';
      existingSubmission.mediaUrl = mediaUrl.trim();
      if (thumbnailUrl) existingSubmission.thumbnailUrl = thumbnailUrl.trim();
      existingSubmission.submittedAt = now;
      existingSubmission.status = 'submitted';
      await existingSubmission.save();
      submission = existingSubmission;
    } else {
      submission = await Submission.create({
        competitionId: competition._id,
        userId: new mongoose.Types.ObjectId(userId),
        registrationId: registration._id,
        title: title.trim(),
        description: description ? description.trim() : '',
        mediaUrl: mediaUrl.trim(),
        thumbnailUrl: thumbnailUrl ? thumbnailUrl.trim() : undefined,
        submittedAt: now,
        status: 'submitted',
      });
    }

    res.status(200).json({
      success: true,
      message: existingSubmission ? 'Submission updated successfully!' : 'Project submitted successfully!',
      submission,
    });
  } catch (error: any) {
    console.error('Error submitting project:', error);
    res.status(500).json({ success: false, message: 'Server error during submission', error: error.message });
  }
}

/**
 * GET /api/competitions/:id/winners
 * Returns previous winners list
 */
export async function getCompetitionWinners(req: Request, res: Response): Promise<void> {
  try {
    const id = getParamId(req);
    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { slug: id };
    const competition = await Competition.findOne(query);

    if (!competition) {
      res.status(404).json({ success: false, message: 'Competition not found' });
      return;
    }

    const winners = await Winner.find({ competitionId: competition._id }).sort({ position: 1 });

    res.json({
      success: true,
      count: winners.length,
      competitionId: competition._id,
      winners,
    });
  } catch (error: any) {
    console.error('Error fetching winners:', error);
    res.status(500).json({ success: false, message: 'Server error fetching winners', error: error.message });
  }
}

/**
 * GET /api/competitions/:id/referral
 * Returns user's referral code, link, and referral stats
 */
export async function getReferralDetails(req: Request, res: Response): Promise<void> {
  try {
    const id = getParamId(req);
    const userId = getRequestUserId(req);

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { slug: id };
    const competition = await Competition.findOne(query);

    if (!competition) {
      res.status(404).json({ success: false, message: 'Competition not found' });
      return;
    }

    // Count how many people registered using this user's referral code
    const referralsCount = await Registration.countDocuments({
      competitionId: competition._id,
      referredByCode: user.referralCode,
    });

    const referralLink = `https://feedants.com/c/${competition.slug}?ref=${user.referralCode}`;

    res.json({
      success: true,
      referralCode: user.referralCode,
      referralLink,
      referralsCount,
      bonusPerk: 'Share with friends — Top 3 referrers receive special Feedants exclusive merchandise & wildcard entry perks!',
    });
  } catch (error: any) {
    console.error('Error fetching referral details:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
}
