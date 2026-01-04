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

export const protect = async (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  // console.log("🔒 PROTECT MIDDLEWARE - Auth Header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("❌ No Bearer token");
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.SECRET as string
    ) as JWTPayload;
    
    

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      console.log("❌ User not found");
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user; // ✅ QUAN TRỌNG
    next();
  } catch (error) {
    console.log("❌ Token error:", error);
    return res.status(401).json({ message: "Token invalid" });
  }
};


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






