import { FastifyRequest, FastifyReply } from 'fastify';
import Message from '../models/Message';

export class MessageController {
    async getMessages(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userId = (request as any).user!.userId;
            const messages = await Message.find({
                $or: [{ sender: userId }, { recipient: userId }]
            }).sort({ createdAt: 'asc' });
            reply.send(messages);
        } catch (error) {
            reply.code(500).send({ error: 'Error fetching messages' });
        }
    }

    async sendMessage(request: FastifyRequest<{
        Body: { recipientId: string; content: string }
    }>, reply: FastifyReply) {
        const { recipientId, content } = request.body;
        try {
            const senderId = (request as any).user!.userId;
            const message = new Message({
                sender: senderId,
                recipient: recipientId,
                content
            });
            await message.save();
            reply.send(message);
        } catch (error) {
            reply.code(500).send({ error: 'Error sending message' });
        }
    }
}