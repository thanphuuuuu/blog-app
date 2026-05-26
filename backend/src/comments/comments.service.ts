import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, DeepPartial } from 'typeorm';
import { Comment } from './comment.entity';
import { Post } from '../posts/post.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  async findByPost(postId: string) {
    const comments = await this.commentsRepository.find({
      where: { post_id: postId, parent_id: IsNull() },
      relations: ['author', 'replies', 'replies.author'],
      order: { created_at: 'ASC' },
    });

    // Remove passwords from authors
    const sanitizeAuthor = (c: Comment) => {
      if (c.author) {
        const a = c.author as unknown as { password?: string };
        delete a.password;
      }
      if (c.replies) {
        c.replies.forEach(sanitizeAuthor);
      }
      return c;
    };

    return comments.map(sanitizeAuthor);
  }

  async create(
    postId: string,
    userId: string,
    createCommentDto: CreateCommentDto,
  ) {
    const post = await this.postsRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.author_id === userId && !createCommentDto.parent_id) {
      throw new ForbiddenException('You cannot create top-level comments on your own post');
    }

    if (createCommentDto.parent_id) {
      const parent = await this.commentsRepository.findOne({
        where: { id: createCommentDto.parent_id, post_id: postId },
      });
      if (!parent) {
        throw new NotFoundException('Parent comment not found in this post');
      }
    }

    const commentData: DeepPartial<Comment> = {
      content: createCommentDto.content,
      post_id: postId,
      author_id: userId,
    };

    if (createCommentDto.parent_id) {
      commentData.parent_id = createCommentDto.parent_id;
    }

    const comment = this.commentsRepository.create(commentData);

    return this.commentsRepository.save(comment);
  }

  async remove(id: string, userId: string) {
    const comment = await this.commentsRepository.findOne({ where: { id } });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.author_id !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.commentsRepository.remove(comment);
    return null;
  }
}
