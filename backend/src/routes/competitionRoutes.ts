import { Router } from 'express';
import {
  getCompetitions,
  getCompetitionById,
  registerForCompetition,
  submitProject,
  getCompetitionWinners,
  getReferralDetails,
} from '../controllers/competitionController.js';

const router = Router();

router.get('/', getCompetitions);
router.get('/:id', getCompetitionById);
router.post('/:id/register', registerForCompetition);
router.post('/:id/submit', submitProject);
router.get('/:id/winners', getCompetitionWinners);
router.get('/:id/referral', getReferralDetails);

export default router;
