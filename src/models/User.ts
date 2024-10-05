import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    email: string;
    name: string;
    password: string;
    userType: 'FREELANCER' | 'CLIENT';
    skills: string[];
}

const userSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    userType: { type: String, enum: ['FREELANCER', 'CLIENT'], default: 'FREELANCER' },
    skills: [{ type: String }]
}, { timestamps: true });

export default mongoose.model<IUser>('User', userSchema);