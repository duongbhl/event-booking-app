import { Request, Response } from 'express';
import Payment from '../models/payment.model';



export const listPayments = async (req: any, res: Response) => {
const payments = await Payment.find({ user: req.user!._id }).sort('-createdAt');
res.json(payments);
};