import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getMessagesByUser(userId: string) {
    return this.prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { timestamp: 'asc' },
    });
  }

  async createMessage(data: { text: string; sender: string; timestamp?: Date; userId: string }) {
    return this.prisma.chatMessage.create({
      data: {
        text: data.text,
        sender: data.sender,
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
        userId: data.userId,
      },
    });
  }
}
