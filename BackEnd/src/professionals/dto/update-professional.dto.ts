import { IsBoolean, IsOptional, IsString } from 'class-validator';
export class UpdateProfessionalDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() specialty?: string;
  @IsOptional() @IsString() bio?: string;
  @IsOptional() @IsString() avatarUrl?: string;
  @IsOptional() @IsBoolean() active?: boolean;
}
