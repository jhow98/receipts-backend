import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  RelationId,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity('recipes')
export class Recipe {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.recipes, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @RelationId((recipe: Recipe) => recipe.user)
  userId: number;

  @ManyToOne(() => Category, { eager: false })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @RelationId((recipe: Recipe) => recipe.category)
  categoryId: number;

  @Column({ length: 45 })
  name: string;

  @Column({ name: 'preparation_time_minutes', type: 'int' })
  preparation_time_minutes: number;

  @Column({ type: 'int' })
  servings: number;

  @Column({ name: 'preparation_method', type: 'text' })
  preparation_method: string;

  @Column({ type: 'text' })
  ingredients: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
