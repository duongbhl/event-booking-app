import { Request, Response } from 'express';
import User from '../models/user.model';



export const updateProfile = async (req: any, res: Response) => {
    const { name, avatar, country, interests, location } = req.body as Partial<{
        name: string; avatar: string; country: string; interests: string[]; location: string;
    }>;
    const user = await User.findByIdAndUpdate(req.user!._id, { name, avatar, country, interests, location }, { new: true });
    res.json(user);
};