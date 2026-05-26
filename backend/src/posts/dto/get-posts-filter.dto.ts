import { IsOptional, IsString, IsInt, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class GetPostsFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  likedBy?: string;

  @IsOptional()
  @IsIn(['week', 'month', 'all'])
  timeframe?: 'week' | 'month' | 'all' = 'all';

  @IsOptional()
  @IsIn(['latest', 'views', 'likes', 'trending'])
  sortBy?: 'latest' | 'views' | 'likes' | 'trending' = 'latest';
}
