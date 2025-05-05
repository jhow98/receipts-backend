import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

describe('RecipeController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userToken: string;
  let recipeId: number;
  let testUserId: number;

  const password = 'senha123';
  const hashedPassword = bcrypt.hashSync(password, 10);
  const currentLogin = `usuario.teste-e2e.${Date.now()}`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    dataSource = app.get<DataSource>(DataSource);

    await dataSource.query(
      `INSERT INTO users (name, login, password) VALUES (?, ?, ?)`,
      ['Usuário Novo', currentLogin, hashedPassword]
    );

    const [user] = await dataSource.query(
      `SELECT id FROM users WHERE login = ?`,
      [currentLogin]
    );
    testUserId = user.id;

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ login: currentLogin, password });
    
    userToken = loginRes.body.access_token;
  });

  // Teste 1 - Criação
  it('1. CRIA receita', async () => {
    const res = await request(app.getHttpServer())
      .post('/recipes')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Receita teste-e2e',
        preparation_time_minutes: 1,
        servings: 1,
        preparation_method: 'Misturar tudo',
        ingredients: 'Ingrediente 1, Ingrediente 2',
        categoryId: 1
      });

    expect(res.status).toBe(HttpStatus.CREATED);
    recipeId = res.body.id;
  });

  // Teste 2 - Busca
  it('2. BUSCA receita', async () => {
    const res = await request(app.getHttpServer())
      .get(`/recipes/${recipeId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(HttpStatus.OK);
  });

  // Teste 3 - Atualização
  it('3. ATUALIZA receita', async () => {
    const res = await request(app.getHttpServer())
      .put(`/recipes/${recipeId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Receita Atualizada' });

    expect(res.status).toBe(HttpStatus.OK);
  });

  // Teste 4 - Delete
  it('4. DELETA receita', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/recipes/${recipeId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(HttpStatus.NO_CONTENT);
  });

  afterAll(async () => {
    await dataSource.query(`DELETE FROM users WHERE login LIKE 'usuario.teste-e2e.%'`);
    await app.close();
  });
});