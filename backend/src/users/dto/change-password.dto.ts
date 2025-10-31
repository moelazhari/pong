import { IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordDTO {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  newPassword: string;
}