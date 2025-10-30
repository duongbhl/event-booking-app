import { NextFunction, Request, Response } from "express"
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()
import User from "../models/user.model"
import { decode } from "punycode"

export interface JWTPayload {
    id:string,
    iat:number,
    exp:number
}

export const protect = async(req:any,res:Response,nextFunction:NextFunction) => {
    let token = req.headers.authorization.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1]:undefined;
    if(!token) return res.status(401).json({message:"No authorized, no token"})

    try {
        const decoded = jwt.verify(token,process.env.SECRET as string) as JWTPayload;
        const user = await User.findById(decoded.id).select('-password');
        if(!user) return res.status(401).json({message:"Not authorized"})
        req.user={id: decoded.id, role:user.role};
        nextFunction();
    } catch (error) {
        return res.status(401).json({message:"Token invalid"});
    }
}


export const authorize = (role: "admin" | "user") => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

export const errorHandler = (err: any, _req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    const status = err.status || 500;
    res.status(status).json({
        message: err.message || "Internal Server Error",
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
}






