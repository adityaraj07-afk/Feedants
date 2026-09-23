import { Request, Response } from 'express';
import { User } from '../models/index.js';

export async function getUsers(req: Request, res: Response): Promise<void> {
  try {
    const users = await User.find().sort({ createdAt: 1 });
    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching users', error: error.message });
  }
}

export async function getCurrentUser(req: Request, res: Response): Promise<void> {
  try {
    const headerUser = req.headers['x-user-id'];
    const userId = typeof headerUser === 'string' ? headerUser : req.query.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'x-user-id header is missing' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching user', error: error.message });
  }
}
