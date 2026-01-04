import { Response } from 'express';
import User from '../models/user.model';

export const getMyProfile = async (req: any, res: Response) => {
    try {
        const user = await User.findById(req.user!._id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch profile' });
    }
};

export const updateProfile = async (req: any, res: Response) => {
    const { name, avatar, country, interests, location, description } = req.body as Partial<{
        name: string; avatar: string; country: string; interests: string[]; location: string; description: string;
    }>;
    const user = await User.findByIdAndUpdate(req.user!._id, { name, avatar, country, interests, location, description }, { new: true });
    res.json(user);
};
