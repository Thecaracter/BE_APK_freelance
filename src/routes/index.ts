// src/routes/index.ts
import { FastifyInstance, FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify';
import jwt from 'jsonwebtoken';
import { UserController } from '../controllers/userController';
import { JobController } from '../controllers/jobController';
import { MessageController } from '../controllers/messageController';

// Define interfaces for request bodies
interface CreateJobBody {
    title: string;
    description: string;
    budget: number;
    skills: string[];
}

interface ApplyJobBody {
    jobId: string;
    proposal: string;
}

interface SendMessageBody {
    recipientId: string;
    content: string;
}

const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
        reply.code(401).send({ error: 'No token provided' });
        return;
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
        (request as any).user = decoded;
    } catch (error) {
        reply.code(401).send({ error: 'Invalid token' });
    }
};

export default async function routes(fastify: FastifyInstance) {
    const userController = new UserController();
    const jobController = new JobController();
    const messageController = new MessageController();

    // Options with authentication
    const authenticateOpts: RouteShorthandOptions = {
        preHandler: authenticate
    };

    // User routes
    fastify.post('/register', userController.register);
    fastify.post('/login', userController.login);

    // Job routes
    fastify.get('/jobs', jobController.getAllJobs);

    fastify.post<{
        Body: CreateJobBody
    }>('/jobs', {
        ...authenticateOpts,
        handler: jobController.createJob
    });

    fastify.post<{
        Body: ApplyJobBody
    }>('/apply', {
        ...authenticateOpts,
        handler: jobController.applyForJob
    });

    // Message routes
    fastify.get('/api/messages', {
        ...authenticateOpts,
        handler: messageController.getMessages
    });

    fastify.post<{
        Body: SendMessageBody
    }>('/api/messages', {
        ...authenticateOpts,
        handler: messageController.sendMessage
    });
}