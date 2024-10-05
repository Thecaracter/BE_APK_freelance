import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface IJob extends Document {
    title: string;
    description: string;
    budget: number;
    status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    owner: IUser['_id'];
    skills: string[];
}

const jobSchema = new Schema<IJob>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    budget: { type: Number, required: true },
    status: { type: String, enum: ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], default: 'OPEN' },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    skills: [{ type: String }]
}, { timestamps: true });

export default mongoose.model<IJob>('Job', jobSchema);