import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Category } from '../categories/category.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  originalTitle?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  author?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  detailedDescription?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price?: number;

  @Column({ type: 'varchar', length: 10, nullable: true, default: 'GBP' })
  currency?: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  rating?: number;

  @Column({ type: 'int', default: 0 })
  reviewCount: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  isbn?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  isbn13?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  publisher?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  publicationDate?: string;

  @Column({ type: 'int', nullable: true })
  pages?: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  language?: string;

  @Column({ type: 'text', nullable: true })
  dimensions?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  weight?: string;

  @Column({ type: 'boolean', default: true })
  isAvailable: boolean;

  @Column({ type: 'text', nullable: true })
  imageUrl?: string;

  @Column({ type: 'text', nullable: true })
  imageLocalPath?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  imageFilename?: string;

  @Column({ type: 'text', nullable: true })
  worldOfBooksUrl?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  condition?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  format?: string;

  @Column('simple-array', { nullable: true })
  tags?: string[];

  @Column('simple-array', { nullable: true })
  genres?: string[];

  @Column({ type: 'text', nullable: true })
  synopsis?: string;

  @Column({ type: 'text', nullable: true })
  tableOfContents?: string;

  @Column({ type: 'text', nullable: true })
  aboutAuthor?: string;

  @Column('simple-array', { nullable: true })
  similarProducts?: string[];

  @Column({ type: 'int' })
  categoryId: number;

  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  // Use forward reference for reviews to avoid circular dependency
  @OneToMany('ProductReview', 'product')
  reviews: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
