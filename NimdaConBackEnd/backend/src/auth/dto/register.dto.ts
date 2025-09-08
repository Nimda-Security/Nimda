import { IsString, IsNotEmpty, MinLength, IsEmail } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  password: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}
