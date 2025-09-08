import { Controller, Get, Post, Body } from '@nestjs/common';

@Controller()
export class AppController {
  
  @Get('api/test')
  getTest() {
    return { message: 'Hello seoyun' };
  }

  @Post('api/test')
  postTest(@Body() body: any) {
    return { 
      message: 'Hello seoyun',
      receivedData: body,
      timestamp: new Date().toISOString()
    };
  }
}
