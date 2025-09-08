import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {

  // UsersService : 사용자 관리 도구 (관리자 계정 생성, 임시(메모리) DB 연동, 사용자 탐색)
  // JwtService : JWT 토큰 생성 도구 
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // validateUser : 사용자 인증 로직 
  // 사용자명과 비밀번호를 받아서 사용자 정보를 탐색 
  // 사용자명이 일치하는 사용자 정보를 반환 (User or undefined)
  async validateUser(username: string, password: string): Promise<any> {

    // #1 사용자 이름으로 사용자 탐색 
    const user = await this.usersService.findByUsername(username);

    // #2 사용자 명과 해시화된 비밀번호를 비교 
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }

    // #3 검증 실패 
    return null;
  }

  // login : 사용자 로그인 처리 
  // 사용자 정보를 받아서 JWT 토큰 생성 
  // 생성된 토큰을 반환 
  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // register : 사용자 회원가입 처리
  // 사용자명, 비밀번호, 이메일을 받아서 새 사용자 생성
  // 생성된 사용자 정보를 반환

  async register(username: string, password: string, email: string): Promise<any> {
    
    // #1 중복 사용자명 확인
    const existingUser = await this.usersService.findByUsername(username);
    if (existingUser) {
      throw new UnauthorizedException('Username already exists');
    }

    // #2 새 사용자 생성
    const user = await this.usersService.create(username, password, email);
    
    // #3 비밀번호 제외하고 반환
    const { password: _, ...result } = user;
    return result;
  }
}
