import { Server, Socket } from 'socket.io';
import Message from '../models/Message';

export interface ChatUser {
    userId: string;
    socketId: string;
}

export interface MessageData {
    senderId: string;
    receiverId: string;
    content: string;
}

let onlineUsers: ChatUser[] = [];

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

export const setupSocketIO = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        console.log('User connected:', socket.id);

        socket.on('addUser', (userId: string) => {
            addUser(userId, socket.id);
            io.emit('getUsers', onlineUsers);
        });

        socket.on('sendMessage', async (data: MessageData) => {
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
};