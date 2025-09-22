import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('user_navigation')
export class UserNavigation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  userId: string;

  @Column({ type: 'varchar', length: 500 })
  path: string;

  @Column({ type: 'text', nullable: true })
  searchParams?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  title?: string;

  @CreateDateColumn()
  timestamp: Date;
}
