import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

import { User } from '../modules/users/entities/user.entity';
import { Category } from '../modules/categories/entities/category.entity';
import { Recipe } from '../modules/recipes/entities/recipe.entity';

dotenv.config();

const isTsNode = process.env.TS_NODE_DEV === 'true';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: isTsNode
    ? [User, Category, Recipe]
    : [__dirname + '/../modules/**/entities/*.entity.js'],
  migrations: [__dirname + '/migrations/*.js'],
  synchronize: false,
  logging: true,
});
