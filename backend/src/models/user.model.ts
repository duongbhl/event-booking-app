import mongoose, { Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';


export interface IUser {
    name: string;
    email: string;
    password: string;
    avatar?: string;
    country?: string;
    interests?: string[];
    location?: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
    phone?: string;
    description?: string;
    role: 'user' | 'admin';
    verified: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const schema = new mongoose.Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true, minlength: 6, select: false },
        avatar: String,
        country: String,
        interests: [{ type: String }],
        location: String,
        coordinates: {
            latitude: { type: Number },
            longitude: { type: Number },
        },
        phone: String,
        description: String,
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        verified: { type: Boolean, default: false },
    },
    { timestamps: true }
);

schema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

schema.methods.matchPassword = async function (entered: string) {
    return bcrypt.compare(entered, this.password);
};

const User:Model<IUser> = mongoose.model<IUser>('User', schema);
export default User;
