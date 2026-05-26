import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Post } from './post.entity';
import { Category } from '../categories/category.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { GetPostsFilterDto } from './dto/get-posts-filter.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async findAll(filterDto: GetPostsFilterDto) {
    const { page = 1, limit = 10, search, category, author, likedBy, timeframe, sortBy = 'latest' } = filterDto;

    const query = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.categories', 'category')
      .loadRelationCountAndMap('post.likesCount', 'post.likes')
      .loadRelationCountAndMap('post.commentsCount', 'post.comments');

    // Only return published posts for standard listing
    query.where('post.is_published = :is_published', { is_published: true });

    if (search) {
      query.andWhere(
        '(post.title ILIKE :search OR post.content ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (category) {
      query.andWhere('category.slug = :category', { category });
    }

    if (author) {
      query.andWhere('author.username = :author', { author });
    }

    if (likedBy) {
      query.innerJoin('post.likes', 'like')
        .innerJoin('like.user', 'likeUser')
        .andWhere('likeUser.username = :likedBy', { likedBy });
    }

    if (timeframe && timeframe !== 'all') {
      const date = new Date();
      if (timeframe === 'week') {
        date.setDate(date.getDate() - 7);
      } else if (timeframe === 'month') {
        date.setMonth(date.getMonth() - 1);
      }
      query.andWhere('post.created_at >= :timeframeDate', { timeframeDate: date });
    }

    // Sắp xếp theo tiêu chí
    if (sortBy === 'views') {
      query.orderBy('post.view_count', 'DESC');
    } else if (sortBy === 'likes') {
      // Subquery đếm likes làm cột ảo để sắp xếp bài nhiều like nhất lên đầu
      query.addSelect(
        '(SELECT COUNT(*) FROM likes WHERE likes.post_id = post.id)',
        'likes_count_sort',
      );
      query.orderBy('likes_count_sort', 'DESC');
    } else if (sortBy === 'trending') {
      // Sắp xếp theo trending: views + likes * 5 + comments * 3
      query.addSelect(
        'post.view_count + (SELECT COUNT(*) FROM likes WHERE likes.post_id = post.id) * 5 + (SELECT COUNT(*) FROM comments WHERE comments.post_id = post.id) * 3',
        'trending_score_sort',
      );
      query.orderBy('trending_score_sort', 'DESC');
    } else {
      query.orderBy('post.created_at', 'DESC');
    }

    const total = await query.getCount();
    query.skip((page - 1) * limit).take(limit);
    const posts = await query.getMany();

    return {
      success: true,
      data: posts.map((p) => {
        if (p.author) {
          const a = p.author as unknown as { password?: string };
          delete a.password;
        }
        return p;
      }),
      message: 'Posts retrieved successfully',
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOneBySlug(slug: string) {
    const post = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.categories', 'category')
      .loadRelationCountAndMap('post.likesCount', 'post.likes')
      .loadRelationCountAndMap('post.commentsCount', 'post.comments')
      .where('post.slug = :slug', { slug })
      .getOne();

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Increment view count
    post.view_count += 1;
    await this.postRepository.save(post);

    if (post.author) {
      const a = post.author as unknown as { password?: string };
      delete a.password;
    }
    return post;
  }

  async create(createPostDto: CreatePostDto, userId: string) {
    const { category_ids, ...postData } = createPostDto;

    const baseSlug = postData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    // Handle unique slug
    let slug = baseSlug;
    let count = 1;
    while (await this.postRepository.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    let categories: Category[] = [];
    if (
      category_ids &&
      Array.isArray(category_ids) &&
      category_ids.length > 0
    ) {
      categories = await this.categoryRepository.findBy({
        id: In(category_ids),
      });
    }

    const post = this.postRepository.create({
      ...postData,
      slug,
      author_id: userId,
      categories,
    });

    return this.postRepository.save(post);
  }

  async update(id: string, updatePostDto: UpdatePostDto, userId: string) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['categories'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.author_id !== userId) {
      throw new ForbiddenException('You can only update your own posts');
    }

    const { category_ids, ...updateData } = updatePostDto;

    if (
      category_ids &&
      Array.isArray(category_ids) &&
      category_ids.length > 0
    ) {
      const categories = await this.categoryRepository.findBy({
        id: In(category_ids),
      });
      post.categories = categories;
    }

    Object.assign(post, updateData);

    return this.postRepository.save(post);
  }

  async remove(id: string, userId: string) {
    const post = await this.postRepository.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.author_id !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.postRepository.remove(post);
    return null; // Return null so interceptor formats as empty data
  }
}
