import { IsInt, IsISO8601, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class CreateAppointmentDto {
  @IsInt()
  @Min(1)
  professionalId: number;

  @IsISO8601()
  startAt: string; // ISO

  @IsISO8601()
  endAt: string;   // ISO

  @IsOptional()
  @IsNotEmpty()
  notes?: string;
}
