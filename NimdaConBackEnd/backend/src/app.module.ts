import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    // TypeORM 설정을 임시로 비활성화 (데이터베이스 연결 없이 실행)
    // TypeOrmModule.forRoot({
    //   type: 'mysql',
    //   host: 'localhost',
    //   port: 3306,
    //   username: 'root',
    //   password: '',
    //   database: 'nimda_con_db',
    //   synchronize: true, // 개발환경에서만 사용
    //   logging: true,
    //   autoLoadEntities: true,
    // }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}