export type LifecyclePhase =
  | 'upcoming'
  | 'registration_open'
  | 'registration_full'
  | 'registration_closed'
  | 'submission_open'
  | 'submission_closed'
  | 'results_declared';

export interface IPrizeBreakdown {
  position: number;
  label: string;
  rewardAmount: number;
  perks: string[];
}

export interface IJudgingParameter {
  parameter: string;
  weightage: number;
  description: string;
}

export interface IJudge {
  name: string;
  title: string;
  avatarUrl: string;
  bio: string;
  introVideoUrl: string;
}

export interface ITimeline {
  registrationStartDate: string;
  registrationEndDate: string;
  submissionStartDate: string;
  submissionEndDate: string;
  resultDate: string;
}

export interface ITabsContent {
  about: string;
  judgingParameters: IJudgingParameter[];
  rulesAndEligibility: string[];
}

export interface ICompetition {
  _id: string;
  title: string;
  slug: string;
  bannerUrl: string;
  categoryTags: string[];
  hasCertificate: boolean;
  prizePool: {
    total: number;
    currency: string;
    breakdown: IPrizeBreakdown[];
  };
  entryFee: {
    amount: number;
    currency: string;
    isFree: boolean;
  };
  capacity: {
    maxSpots: number;
    filledSpots: number;
  };
  judge: IJudge;
  timeline: ITimeline;
  tabsContent: ITabsContent;
  statusOverride: string;
  isRegistered: boolean;
  registrationDetails: IRegistration | null;
  hasSubmitted: boolean;
  submissionDetails: ISubmission | null;
  spotsLeft: number;
  isSpotsFull: boolean;
  currentPhase: LifecyclePhase;
  phaseLabel?: string;
  serverTime: string;
  nextDeadline: string | null;
  nextDeadlineLabel: string;
  ctaText: string;
  ctaAction: 'REGISTER' | 'SUBMIT' | 'VIEW_SUBMISSION' | 'VIEW_WINNERS' | 'DISABLED';
  winnersCount?: number;
}

export interface IUser {
  _id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl: string;
  bio?: string;
  referralCode: string;
}

export interface IRegistration {
  _id: string;
  competitionId: string;
  userId: string;
  registrationCode: string;
  referredByCode?: string;
  registeredAt: string;
  status: 'confirmed' | 'cancelled';
}

export interface ISubmission {
  _id: string;
  competitionId: string;
  userId: string;
  registrationId: string;
  title: string;
  description?: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  submittedAt: string;
  status: 'submitted' | 'under_review' | 'evaluated';
  score?: number;
  feedback?: string;
}

export interface IWinner {
  _id: string;
  competitionId: string;
  edition: string;
  position: number;
  userName: string;
  userAvatarUrl: string;
  userHandle: string;
  winningProjectTitle: string;
  projectMediaUrl: string;
  prizeWon: string;
  announcedAt: string;
}

export interface IReferralData {
  referralCode: string;
  referralLink: string;
  referralsCount: number;
  bonusPerk?: string;
  competitionTitle?: string;
}

export type IReferralInfo = IReferralData;

