import { IsDateString, IsOptional, IsString } from 'class-validator';
export class UpdateAppointmentDto {
  @IsOptional() @IsDateString() startAt?: string;
  @IsOptional() @IsDateString() endAt?: string;
  @IsOptional() @IsString() notes?: string;
}
