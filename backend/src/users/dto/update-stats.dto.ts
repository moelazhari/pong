import { IsNumber, Min, IsOptional } from 'class-validator';

export class UpdateStatsDTO {
  @IsOptional()
  @IsNumber()
  @Min(0)
  level?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  XP?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  wins?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  loses?: number;
}