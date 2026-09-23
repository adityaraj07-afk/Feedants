import { Router } from 'express';
import { getUsers, getCurrentUser } from '../controllers/userController.js';

const router = Router();

router.get('/', getUsers);
router.get('/me', getCurrentUser);

export default router;
