import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';
import { IJob } from './Job';

export interface IJobApplication extends Document {
    job: IJob['_id'];
    applicant: IUser['_id'];
    proposal: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

const jobApplicationSchema = new Schema<IJobApplication>({
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    applicant: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    proposal: { type: String, required: true },
    status: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED'], default: 'PENDING' }
}, { timestamps: true });

export default mongoose.model<IJobApplication>('JobApplication', jobApplicationSchema);