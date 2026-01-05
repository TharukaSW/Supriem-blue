import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import type { Response } from 'express';
import { join } from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Catch-all route for Angular routing in production
  @Get('*')
  serveApp(@Res() res: Response): void {
    if (process.env.NODE_ENV === 'production') {
      res.sendFile(join(__dirname, '..', 'public', 'index.html'));
    } else {
      res.status(404).send('Not Found - Development Mode');
    }
  }
}
