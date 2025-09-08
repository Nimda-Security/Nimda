import { Controller, Post, Body, UnauthorizedException, HttpStatus, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('api/auth')
export class AuthController {

  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    try {
      // #1 사용자 검증 로직 
      const user = await this.authService.validateUser(
        loginDto.username, // 유저가 입력한 사용자명
        loginDto.password, // 유저가 입력한 비밀번호 
      );
      
      // #1.1 사용자 검증 실패 시 예외 처리 
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
      
      // #1.2 사용자 검증 성공 시 로그인 처리 시만
      const result = await this.authService.login(user);
      return {
        success: true,
        message: 'Login successful',
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Login failed',
        data: null
      };
    }
  }

  // #2 회원가입 로직 
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    try {
      // #2.1 회원가입 처리
      const user = await this.authService.register(
        registerDto.username, 
        registerDto.password, 
        registerDto.email
      );
      
      // #2.2 회원가입 성공 시 JWT 토큰 발급 (자동 로그인)
      const result = await this.authService.login(user);
      return {
        success: true,
        message: 'Registration successful',
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Registration failed',
        data: null
      };
    }
  }
}

/**
 * @Body() - Request에 포함된 데이터를 받아온다. 
 * 여기서는 사용자가 로그인 폼에 입력한 데이터 {username: string, password: string} 문자열 검증 
 */