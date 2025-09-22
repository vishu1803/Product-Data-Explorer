import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_reviews')
export class ProductReview {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  reviewerName?: string;

  @Column({ type: 'int' })
  rating: number; // 1-5 stars

  @Column({ type: 'varchar', length: 300, nullable: true })
  reviewTitle?: string;

  @Column({ type: 'text', nullable: true })
  reviewText?: string;

  @Column({ type: 'boolean', default: false })
  isVerifiedPurchase: boolean;

  @Column({ type: 'date', nullable: true })
  reviewDate?: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  helpfulCount?: string;

  @Column({ type: 'int' })
  productId: number;

  @ManyToOne(() => Product, (product) => product.reviews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @CreateDateColumn()
  createdAt: Date;
}
