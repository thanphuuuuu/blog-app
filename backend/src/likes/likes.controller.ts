import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/auth.service';

@Controller('posts/:postId/like')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  // Public endpoint: lấy số lượt like của một bài post
  @Get()
  async getLikeCount(@Param('postId') postId: string) {
    return this.likesService.getLikeCount(postId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async likePost(
    @Param('postId') postId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.likesService.likePost(postId, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete()
  async unlikePost(
    @Param('postId') postId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.likesService.unlikePost(postId, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('status')
  async getLikeStatus(
    @Param('postId') postId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const liked = await this.likesService.hasLiked(postId, user.sub);
    return { liked };
  }
}
