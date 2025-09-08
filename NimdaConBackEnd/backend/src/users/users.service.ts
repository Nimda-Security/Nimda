import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {

  // 임시로 메모리에 사용자 데이터 저장 (실제로는 데이터베이스 사용)
  private users: User[] = [];

  constructor() {
    // 서비스 초기화 시 admin 사용자 생성 (테스트용 계정)
    // 추후에 DataBase 연동 
    this.initializeAdminUser(); 
  }

  // initializeAdminUser : 서비스 초기화시 자동으로 어드민 계정 생성 
  private async initializeAdminUser() {
    const hashedPassword = await bcrypt.hash('1234', 10);
    this.users.push({
      id: 1,
      username: 'admin',
      password: hashedPassword,
      email: 'admin@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // findByUsername : 사용자명으로 사용자 탐색 
  // 사용자명이 일치하는 사용자 정보를 반환 (User or undefined)
  async findByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async findById(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async create(username: string, password: string, email: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: this.users.length + 1,
      username,
      password: hashedPassword,
      email,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }
}
