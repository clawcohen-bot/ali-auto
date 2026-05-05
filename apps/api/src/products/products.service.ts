import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryProductsDto } from './dto/query-products.dto';
import { SyncProductItemDto } from './dto/sync-products.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryProductsDto) {
    const { category, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where = category ? { category } : {};

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { data, total, page };
  }

  async syncProducts(products: SyncProductItemDto[]) {
    let synced = 0;

    for (const product of products) {
      await this.prisma.product.upsert({
        where: { aliId: product.aliId },
        create: {
          aliId: product.aliId,
          title: product.title,
          price: product.price,
          currency: product.currency ?? 'USD',
          imageUrl: product.imageUrl,
          productUrl: product.productUrl,
          category: product.category,
          rating: product.rating ?? null,
          soldCount: product.soldCount ?? null,
        },
        update: {
          title: product.title,
          price: product.price,
          currency: product.currency ?? 'USD',
          imageUrl: product.imageUrl,
          productUrl: product.productUrl,
          category: product.category,
          rating: product.rating ?? null,
          soldCount: product.soldCount ?? null,
        },
      });
      synced++;
    }

    return { synced };
  }
}
