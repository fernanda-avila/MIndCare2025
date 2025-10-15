import { Controller, Post, Body } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('gemini')
@Public()
export class GeminiController {
  constructor(private gemini: GeminiService) {}

  @Post()
  async generate(@Body() body: { prompt: string }) {
    const text = await this.gemini.generate(body.prompt || '');
    return { text };
  }
}
