import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '../../common/enums/role.enum';
export class CreateUserDto {
  @IsEmail() email: string;
  @IsString() name: string;
  @IsString() @MinLength(6) password: string;
  @IsOptional() @IsEnum(Role) role?: Role;
  @IsOptional() @IsString() avatarUrl?: string;
  @IsOptional() @IsString() specialty?: string;
  @IsOptional() @IsString() bio?: string;
}
