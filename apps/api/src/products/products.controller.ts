import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { QueryProductsDto } from './dto/query-products.dto';
import { SyncProductsDto } from './dto/sync-products.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(@Query() query: QueryProductsDto) {
    return this.productsService.findAll(query);
  }

  @Post('sync')
  @HttpCode(200)
  async sync(
    @Headers('x-sync-secret') secret: string,
    @Body() body: SyncProductsDto,
  ) {
    const expectedSecret = process.env.SYNC_SECRET;
    if (!expectedSecret || secret !== expectedSecret) {
      throw new UnauthorizedException('Invalid sync secret');
    }

    return this.productsService.syncProducts(body.products);
  }
}
