import { FastifyRequest as OriginalFastifyRequest } from 'fastify';
import { Server as SocketIOServer } from 'socket.io';

declare module 'fastify' {
    export interface FastifyRequest extends OriginalFastifyRequest {
        user?: {
            userId: string;
        };
    }

    export interface FastifyInstance {
        io: SocketIOServer;
    }
}