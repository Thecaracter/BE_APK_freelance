import { FastifyInstance } from 'fastify';
import Message from '../models/Message';
import { MessageData } from '../types/serverTypes';

export default async function messageRoutes(server: FastifyInstance) {
    server.post('/send-message', async (request, reply) => {
        const { senderId, receiverId, content } = request.body as MessageData;

        try {
            const message = new Message({
                content,
                sender: senderId,
                receiver: receiverId
            });
            await message.save();

            // Emit the message to the receiver if they're online
            const user = server.io.sockets.sockets.get(receiverId);
            if (user) {
                server.io.to(user.id).emit('getMessage', {
                    senderId,
                    content,
                });
            }

            reply.code(200).send({ success: true, message: 'Message sent' });
        } catch (error) {
            console.error('Error sending message:', error);
            reply.code(500).send({ success: false, error: 'Failed to send message' });
        }
    });

    server.get('/messages/:userId1/:userId2', async (request, reply) => {
        const { userId1, userId2 } = request.params as { userId1: string; userId2: string };

        try {
            const messages = await Message.find({
                $or: [
                    { sender: userId1, receiver: userId2 },
                    { sender: userId2, receiver: userId1 }
                ]
            }).sort({ createdAt: 1 });

            reply.code(200).send({ success: true, messages });
        } catch (error) {
            console.error('Error retrieving messages:', error);
            reply.code(500).send({ success: false, error: 'Failed to retrieve messages' });
        }
    });
}