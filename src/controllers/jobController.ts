import { FastifyRequest, FastifyReply } from 'fastify';
import Job from '../models/Job';
import JobApplication from '../models/JobApplication';

export class JobController {
    async getAllJobs(request: FastifyRequest, reply: FastifyReply) {
        try {
            const jobs = await Job.find().populate('owner', 'name email');
            reply.send(jobs);
        } catch (error) {
            reply.code(500).send({ error: 'Error fetching jobs' });
        }
    }

    async createJob(request: FastifyRequest<{
        Body: {
            title: string;
            description: string;
            budget: number;
            skills: string[]
        }
    }>, reply: FastifyReply) {
        const { title, description, budget, skills } = request.body;
        try {
            const job = new Job({
                title,
                description,
                budget,
                owner: (request as any).user!.userId,
                skills
            });
            await job.save();
            reply.send(job);
        } catch (error) {
            reply.code(500).send({ error: 'Error creating job' });
        }
    }

    async applyForJob(request: FastifyRequest<{
        Body: { jobId: string; proposal: string }
    }>, reply: FastifyReply) {
        const { jobId, proposal } = request.body;
        try {
            const application = new JobApplication({
                job: jobId,
                applicant: (request as any).user!.userId,
                proposal
            });
            await application.save();
            reply.send(application);
        } catch (error) {
            reply.code(500).send({ error: 'Error applying for job' });
        }
    }
}