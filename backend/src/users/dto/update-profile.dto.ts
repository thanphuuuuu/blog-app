import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  username?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  bio?: string;

  // Dùng @IsString() thay vì @IsUrl() để hỗ trợ cả URL lẫn base64 data URL
  @IsString()
  @IsOptional()
  avatar_url?: string;
}
