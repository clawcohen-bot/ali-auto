import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

export class SyncProductItemDto {
  @IsString()
  @IsNotEmpty()
  aliId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsString()
  @IsNotEmpty()
  productUrl: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsOptional()
  @IsNumber()
  rating?: number;

  @IsOptional()
  @IsNumber()
  soldCount?: number;
}

export class SyncProductsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncProductItemDto)
  products: SyncProductItemDto[];
}
