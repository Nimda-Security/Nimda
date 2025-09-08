import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS 설정 추가 - 더 포괄적으로 설정
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      /^http:\/\/localhost:\d+$/, // 모든 로컬호스트 포트 허용
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  // ValidationPipe 추가
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // 모든 IP에서 접속 허용 (0.0.0.0)
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  
  console.log(`🚀 Application is running on: http://0.0.0.0:${process.env.PORT ?? 3000}`);
  console.log(`📱 같은 와이파이에서 접속: http://[내IP주소]:${process.env.PORT ?? 3000}`);
}
bootstrap();
