import { FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export class UserController {
    async register(request: FastifyRequest<{
        Body: {
            email: string;
            name: string;
            password: string;
            userType: 'FREELANCER' | 'CLIENT'
        }
    }>, reply: FastifyReply) {
        const { email, name, password, userType } = request.body;
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = new User({ email, name, password: hashedPassword, userType });
            await user.save();

            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string);
            reply.send({ user, token });
        } catch (error) {
            reply.code(500).send({ error: 'Error creating user' });
        }
    }

    async login(request: FastifyRequest<{
        Body: { email: string; password: string }
    }>, reply: FastifyReply) {
        const { email, password } = request.body;

        try {
            const user = await User.findOne({ email });
            if (!user) {
                return reply.code(400).send({ error: 'Invalid email or password' });
            }

            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return reply.code(400).send({ error: 'Invalid email or password' });
            }

            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string);
            reply.send({ user, token });
        } catch (error) {
            reply.code(500).send({ error: 'Login failed' });
        }
    }
}