import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

import { appLogger } from '../utils/logger';

import * as cookie from 'cookie';

import { jwtService } from '../utils/jwt';
import { CreateNotificationInputDto } from 'src/dto/NotificationDto/notification.dto';
interface AuthenticatedSocket extends Socket {
  userId?: string;
  roles?: string[];
  activeRole?: string;
}

interface JoinContractPayload {
  contractId: string;
}

interface MessagePayload {
  senderName: string;
  senderAvatar: string;
  contractId: string;
  messageId: string;
  senderId: string;
  senderRole: 'client' | 'freelancer';
  message: string;
  attachments: Array<{ fileUrl: string; fileName: string }>;
  sentAt: Date;
}

interface MessageReadPayload {
  contractId: string;
  readBy: string;
  role: 'client' | 'freelancer';
}

let io: Server;

export const initializeSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie;
      if (!cookieHeader) {
        return next(new Error('No cookies found'));
      }

      const cookies = cookie.parse(cookieHeader);
      const token = cookies.accessToken; // 👈 matches cookie name

      console.log(token);
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwtService.verifyToken<{
        userId: string;
        roles: string[];
        activeRole: string;
      }>(token);

      socket.userId = decoded.userId;
      socket.roles = decoded.roles;
      socket.activeRole = decoded.activeRole;

      next();
    } catch (error) {
      appLogger.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    appLogger.info(`User connected: ${socket.userId} (${socket.activeRole})`);

    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
      appLogger.info(`User ${socket.userId} joined personal room`);
    }

    socket.on('join_contract', (payload: JoinContractPayload) => {
      const { contractId } = payload;
      socket.join(`contract:${contractId}`);
      appLogger.info(`User ${socket.userId} joined contract room: ${contractId}`);
    });

    socket.on('leave_contract', (payload: JoinContractPayload) => {
      const { contractId } = payload;
      socket.leave(`contract:${contractId}`);
      appLogger.info(`User ${socket.userId} left contract room: ${contractId}`);
    });

    socket.on('disconnect', () => {
      appLogger.info(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export const emitNewMessage = (contractId: string, message: MessagePayload): void => {
  if (io) {
    io.to(`contract:${contractId}`).emit('new_message', message);
    appLogger.info(`Emitted new_message to contract:${contractId}`);
  }
};

export const emitMessageRead = (contractId: string, payload: MessageReadPayload): void => {
  if (io) {
    io.to(`contract:${contractId}`).emit('messages_read', payload);
    appLogger.info(`Emitted messages_read to contract:${contractId}`);
  }
};

export const emitNotification = (userId: string, payload: CreateNotificationInputDto): void => {
  if (io) {
    io.to(`user:${userId}`).emit('notification', payload);
    appLogger.info(`Emitted notification to user:${userId}`);
  }
};
