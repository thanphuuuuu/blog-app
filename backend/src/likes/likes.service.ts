import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './like.entity';
import { Post } from '../posts/post.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private likesRepository: Repository<Like>,
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  async getLikeCount(postId: string) {
    const count = await this.likesRepository.count({
      where: { post_id: postId },
    });
    return { count };
  }

  async likePost(postId: string, userId: string) {
    const post = await this.postsRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.author_id === userId) {
      throw new ForbiddenException('You cannot like your own post');
    }

    const existingLike = await this.likesRepository.findOne({
      where: { post_id: postId, user_id: userId },
    });

    if (existingLike) {
      throw new ConflictException('You already liked this post');
    }

    const like = this.likesRepository.create({
      post_id: postId,
      user_id: userId,
    });

    await this.likesRepository.save(like);
    return { success: true, message: 'Post liked successfully' };
  }

  async unlikePost(postId: string, userId: string) {
    const like = await this.likesRepository.findOne({
      where: { post_id: postId, user_id: userId },
    });

    if (!like) {
      throw new NotFoundException('Like not found');
    }

    await this.likesRepository.remove(like);
    return null; // For 204 No Content
  }

  async hasLiked(postId: string, userId: string): Promise<boolean> {
    const count = await this.likesRepository.count({
      where: { post_id: postId, user_id: userId },
    });
    return count > 0;
  }
}
