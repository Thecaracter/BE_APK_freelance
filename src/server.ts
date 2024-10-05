// src/server.ts
import fastify from 'fastify';
import cors from '@fastify/cors';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import routes from './routes';
import Message from './models/Message';

dotenv.config();

// Create fastify instance
const server = fastify({ logger: true });

server.register(cors, {
    origin: true
});

// Connect to MongoDB
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
}

// Register routes
server.register(routes);

// Chat user interface
interface ChatUser {
    userId: string;
    socketId: string;
}

// Online users array
let onlineUsers: ChatUser[] = [];

// User management functions
const addUser = (userId: string, socketId: string) => {
    if (!onlineUsers.some((user) => user.userId === userId)) {
        onlineUsers.push({ userId, socketId });
    }
};

const removeUser = (socketId: string) => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (userId: string) => {
    return onlineUsers.find((user) => user.userId === userId);
};

// Setup Socket.IO
let io: Server;

const setupSocketIO = () => {
    if (!io) {
        io = new Server(server.server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST']
            }
        });

        io.on('connection', (socket) => {
            console.log('User connected:', socket.id);

            socket.on('addUser', (userId: string) => {
                addUser(userId, socket.id);
                io.emit('getUsers', onlineUsers);
            });

            socket.on('sendMessage', async (data: { senderId: string; receiverId: string; content: string }) => {
                const user = getUser(data.receiverId);

                try {
                    const message = new Message({
                        content: data.content,
                        sender: data.senderId,
                        receiver: data.receiverId
                    });
                    await message.save();

                    if (user) {
                        io.to(user.socketId).emit('getMessage', {
                            senderId: data.senderId,
                            content: data.content,
                        });
                    }
                } catch (error) {
                    console.error('Error sending message:', error);
                }
            });

            socket.on('disconnect', () => {
                console.log('User disconnected:', socket.id);
                removeUser(socket.id);
                io.emit('getUsers', onlineUsers);
            });
        });
    }
    return io;
};

// Connect to MongoDB
connectDB();

// Vercel serverless function handler
export default async (req: any, res: any) => {
    await server.ready();
    setupSocketIO(); // Setup Socket.IO for each request
    server.server.emit('request', req, res);
};

// For local development
if (require.main === module) {
    const start = async () => {
        try {
            await server.listen({
                port: parseInt(process.env.PORT as string) || 3000,
                host: '0.0.0.0'
            });
            setupSocketIO(); // Setup Socket.IO for local development
        } catch (err) {
            server.log.error(err);
            process.exit(1);
        }
    };
    start();
}