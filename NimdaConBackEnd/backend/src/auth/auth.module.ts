import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  
  // Module Import 
  imports: [
    UsersModule, // 사용자 관리
    PassportModule, // 인증 전략 
    JwtModule.register({ // JWT 토큰 
      secret: 'your-secret-key', // 실제로는 환경변수에서 가져와야 함 (토큰 암호화))
      signOptions: { expiresIn: '3h' }, // 토큰 만료 (대회 시간이 2시간임을 고려)
    }),
  ],

  // providers:  모듈에서 사용하는 서비스 
  providers: [
    AuthService, 
    // LocalStrategy, 
    // JwtStrategy
  ],

  // controllers: Http 요청을 처리하는 컨트롤러 
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}