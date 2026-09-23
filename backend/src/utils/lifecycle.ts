import { ICompetition } from '../models/Competition.js';

export type LifecyclePhase =
  | 'upcoming'
  | 'registration_open'
  | 'registration_full'
  | 'registration_closed'
  | 'submission_open'
  | 'submission_closed'
  | 'results_declared';

export interface ILifecycleState {
  currentPhase: LifecyclePhase;
  phaseLabel: string;
  spotsLeft: number;
  isSpotsFull: boolean;
  canRegister: boolean;
  canSubmit: boolean;
  serverTime: string;
  nextDeadline: Date | null;
  nextDeadlineLabel: string;
  ctaText: string;
  ctaAction: 'REGISTER' | 'SUBMIT' | 'VIEW_SUBMISSION' | 'VIEW_WINNERS' | 'DISABLED';
}

export function computeCompetitionLifecycle(
  competition: ICompetition,
  options: {
    isRegistered?: boolean;
    hasSubmitted?: boolean;
    referenceTime?: Date;
  } = {}
): ILifecycleState {
  const now = options.referenceTime || new Date();
  const { timeline, capacity } = competition;

  const regStart = new Date(timeline.registrationStartDate);
  const regEnd = new Date(timeline.registrationEndDate);
  const subStart = new Date(timeline.submissionStartDate);
  const subEnd = new Date(timeline.submissionEndDate);
  const resDate = new Date(timeline.resultDate);

  const spotsLeft = Math.max(0, capacity.maxSpots - (capacity.filledSpots || 0));
  const isSpotsFull = capacity.filledSpots >= capacity.maxSpots;
  const isRegistered = Boolean(options.isRegistered);
  const hasSubmitted = Boolean(options.hasSubmitted);

  let currentPhase: LifecyclePhase = 'upcoming';
  let phaseLabel = 'Upcoming';
  let nextDeadline: Date | null = regStart;
  let nextDeadlineLabel = 'Registration Opens';

  if (now < regStart) {
    currentPhase = 'upcoming';
    phaseLabel = 'Upcoming';
    nextDeadline = regStart;
    nextDeadlineLabel = 'Registration Opens In';
  } else if (now >= regStart && now <= regEnd) {
    if (isSpotsFull) {
      currentPhase = 'registration_full';
      phaseLabel = 'Registration Full';
      nextDeadline = subStart;
      nextDeadlineLabel = 'Submissions Open In';
    } else {
      currentPhase = 'registration_open';
      phaseLabel = 'Registration Open';
      nextDeadline = regEnd;
      nextDeadlineLabel = 'Registration Ends In';
    }
  } else if (now > regEnd && now < subStart) {
    currentPhase = 'registration_closed';
    phaseLabel = 'Registration Closed';
    nextDeadline = subStart;
    nextDeadlineLabel = 'Submissions Open In';
  } else if (now >= subStart && now <= subEnd) {
    currentPhase = 'submission_open';
    phaseLabel = 'Submissions Open';
    nextDeadline = subEnd;
    nextDeadlineLabel = 'Submissions Close In';
  } else if (now > subEnd && now < resDate) {
    currentPhase = 'submission_closed';
    phaseLabel = 'Judging in Progress';
    nextDeadline = resDate;
    nextDeadlineLabel = 'Results Announced In';
  } else {
    currentPhase = 'results_declared';
    phaseLabel = 'Results Declared';
    nextDeadline = null;
    nextDeadlineLabel = 'Competition Ended';
  }

  const canRegister = currentPhase === 'registration_open' && !isRegistered;
  const canSubmit = currentPhase === 'submission_open' && isRegistered;

  // Determine Primary CTA based on lifecycle phase and user state
  let ctaText = 'Register Now';
  let ctaAction: ILifecycleState['ctaAction'] = 'REGISTER';

  switch (currentPhase) {
    case 'upcoming':
      ctaText = 'Registration Opens Soon';
      ctaAction = 'DISABLED';
      break;

    case 'registration_open':
      if (isRegistered) {
        ctaText = 'Registered ✓ (Awaiting Submissions)';
        ctaAction = 'DISABLED';
      } else {
        ctaText = `Register Now (${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left)`;
        ctaAction = 'REGISTER';
      }
      break;

    case 'registration_full':
      if (isRegistered) {
        ctaText = 'Registered ✓ (Awaiting Submissions)';
        ctaAction = 'DISABLED';
      } else {
        ctaText = 'Registration Full';
        ctaAction = 'DISABLED';
      }
      break;

    case 'registration_closed':
      if (isRegistered) {
        ctaText = 'Registered ✓ (Submissions Starting Soon)';
        ctaAction = 'DISABLED';
      } else {
        ctaText = 'Registration Closed';
        ctaAction = 'DISABLED';
      }
      break;

    case 'submission_open':
      if (!isRegistered) {
        ctaText = 'Registration Closed (Submission Window Active)';
        ctaAction = 'DISABLED';
      } else if (hasSubmitted) {
        ctaText = 'Submission Received ✓ (View / Edit)';
        ctaAction = 'VIEW_SUBMISSION';
      } else {
        ctaText = 'Upload Submission 🚀';
        ctaAction = 'SUBMIT';
      }
      break;

    case 'submission_closed':
      if (hasSubmitted) {
        ctaText = 'Submission Under Review ⏳';
        ctaAction = 'VIEW_SUBMISSION';
      } else if (isRegistered) {
        ctaText = 'Submission Closed (Missed Deadline)';
        ctaAction = 'DISABLED';
      } else {
        ctaText = 'Submissions Closed';
        ctaAction = 'DISABLED';
      }
      break;

    case 'results_declared':
      ctaText = 'View Winners & Rankings 🏆';
      ctaAction = 'VIEW_WINNERS';
      break;
  }

  return {
    currentPhase,
    phaseLabel,
    spotsLeft,
    isSpotsFull,
    canRegister,
    canSubmit,
    serverTime: now.toISOString(),
    nextDeadline,
    nextDeadlineLabel,
    ctaText,
    ctaAction,
  };
}
