import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Category } from './category.entity';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@Body() createCategoryDto: Partial<Category>) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get('hierarchy')
  findAllWithHierarchy() {
    return this.categoriesService.findAllWithHierarchy();
  }

  @Get('main')
  getMainCategories() {
    return this.categoriesService.getMainCategories();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }

  @Get(':id/products')
  async getCategoryProducts(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '12',
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;

    return this.categoriesService.getCategoryProducts(
      id,
      pageNum,
      limitNum,
      search,
      sortBy,
    );
  }

  @Get(':id/subcategories')
  getSubcategories(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.getSubcategoriesByParent(id);
  }

  @Post(':id/subcategories')
  createSubcategory(
    @Param('id', ParseIntPipe) parentId: number,
    @Body() subcategoryData: Partial<Category>,
  ) {
    return this.categoriesService.createSubcategory(parentId, subcategoryData);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: Partial<Category>,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }
}
