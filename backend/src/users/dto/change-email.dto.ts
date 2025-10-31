import { IsEmail, IsString } from 'class-validator';

export class ChangeEmailDTO {
  @IsEmail()
  newEmail: string;

  @IsString()
  password: string;
}