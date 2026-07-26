import { Injectable, ConflictException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService implements OnModuleInit {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async onModuleInit() {
    await this.seedCategories();
  }

  private async seedCategories() {
    const defaultCategories = [
      {
        name: 'Công nghệ & Lập trình',
        slug: 'technology',
        description:
          'Code, Lập trình, Framework, Kiến trúc phần mềm và Công nghệ mới.',
      },
      {
        name: 'Thiết kế & UI/UX',
        slug: 'design',
        description:
          'UI/UX, Components, Typography, Thiết kế sản phẩm và Trải nghiệm.',
      },
      {
        name: 'Kinh doanh & Khởi nghiệp',
        slug: 'business',
        description: 'Kinh doanh, Startup, Thị trường, Chiến lược và Quản trị.',
      },
      {
        name: 'Đời sống & Phát triển bản thân',
        slug: 'lifestyle',
        description:
          'Kỹ năng sống, Năng suất làm việc, Tư duy và Cân bằng cuộc sống.',
      },
      {
        name: 'Du lịch & Ẩm thực',
        slug: 'travel-food',
        description:
          'Hành trình du lịch, Khám phá ẩm thực, Đánh giá địa điểm và Chuyến đi.',
      },
      {
        name: 'Tài chính & Đầu tư',
        slug: 'finance',
        description: 'Tài chính cá nhân, Quản lý dòng tiền, Đầu tư và Kinh tế.',
      },
      {
        name: 'Giải trí & Game',
        slug: 'entertainment',
        description: 'Tin tức Game, Điện ảnh, Âm nhạc và Văn hóa giải trí.',
      },
      {
        name: 'Sức khỏe & Thể thao',
        slug: 'health',
        description:
          'Rèn luyện sức khỏe, Dinh dưỡng, Thể thao và Sức khỏe tinh thần.',
      },
      {
        name: 'Giáo dục & Học tập',
        slug: 'education',
        description:
          'Phương pháp học tập, Tri thức mở, Sách hay và Kỹ năng mới.',
      },
    ];

    for (const cat of defaultCategories) {
      const existing = await this.categoryRepository.findOne({
        where: { slug: cat.slug },
      });
      if (!existing) {
        await this.categoryRepository.save(this.categoryRepository.create(cat));
      }
    }
  }

  async findAll() {
    const categories = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoin('category.posts', 'post')
      .addSelect('COUNT(post.id)', 'postsCount')
      .groupBy('category.id')
      .orderBy('category.created_at', 'ASC')
      .getRawAndEntities();

    return categories.entities.map((cat, index) => ({
      ...cat,
      postsCount: parseInt(categories.raw[index]?.postsCount || '0', 10),
    }));
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const { name, description } = createCategoryDto;
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const existing = await this.categoryRepository.findOne({ where: { slug } });
    if (existing) {
      throw new ConflictException('Category with similar name already exists');
    }

    const category = this.categoryRepository.create({
      name,
      slug: slug || `category-${Date.now()}`,
      description,
    });

    return this.categoryRepository.save(category);
  }
}
