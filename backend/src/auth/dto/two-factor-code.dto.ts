import { IsString, Length } from 'class-validator';

export class TwoFactorCodeDTO {
  @IsString()
  @Length(6, 6)
  code: string;
}