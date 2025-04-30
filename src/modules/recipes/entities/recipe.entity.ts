import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity('recipes')
export class Recipe {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.recipes)
  user: User;

  @ManyToOne(() => Category)
  category: Category;

  @Column({ length: 45 })
  name: string;

  @Column({ name: 'preparation_time_minutes', type: 'int' })
  preparationTimeMinutes: number;

  @Column({ type: 'int' })
  servings: number;

  @Column({ name: 'preparation_method', type: 'text' })
  preparationMethod: string;

  @Column({ type: 'text' })
  ingredients: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
