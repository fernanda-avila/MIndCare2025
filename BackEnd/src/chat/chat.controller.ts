import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { ChatService } from './chat.service';

@Controller('chat')
@Public()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  async getMessages(@Query('userId') userId: string) {
    if (!userId) return [];
    return this.chatService.getMessagesByUser(userId);
  }

  @Post()
  async createMessage(@Body() body: { text: string; sender: string; timestamp?: Date; userId: string }) {
    return this.chatService.createMessage(body);
  }
}
