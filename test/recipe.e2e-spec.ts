import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { Category } from '../src/modules/categories/entities/category.entity';
import { Repository } from 'typeorm';
import { DataSource } from 'typeorm';


describe('RecipeController (e2e)', () => {
  let app: INestApplication;
  let recipeId: number;
  let userId: number;
  let categoryId: number;
  let categoryRepository: Repository<Category>;

  const recipeData = {
    name: 'Bolo E2E',
    preparation_time_minutes: 60,
    servings: 6,
    preparation_method: 'Misture e asse',
    ingredients: 'farinha, ovos, açúcar',
    userId: 0, // será preenchido após criar o user
    categoryId: 0, // idem
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Criação de categoria via repositório
    const dataSource = moduleFixture.get<DataSource>(DataSource);
    const categoryRepository = dataSource.getRepository(Category);
    const category = categoryRepository.create({ name: 'Categoria E2E' });
    const savedCategory = await categoryRepository.save(category);
    categoryId = savedCategory.id;

    // Criação de usuário via endpoint
    const userRes = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'Usuário E2E',
        login: 'usuario.e2e',
        password: 'senha123',
      });

    userId = userRes.body.id;

    // Popula os dados da receita
    recipeData.userId = userId;
    recipeData.categoryId = categoryId;
  });

  it('deve criar uma receita', async () => {
    const res = await request(app.getHttpServer())
      .post('/recipes')
      .send(recipeData);

    expect(res.status).toBe(HttpStatus.CREATED);
    expect(res.body).toHaveProperty('id');
    recipeId = res.body.id;
  });

  it('deve buscar a receita criada', async () => {
    const res = await request(app.getHttpServer())
      .get(`/recipes/${recipeId}`);

    expect(res.status).toBe(HttpStatus.OK);
    expect(res.body).toHaveProperty('name', recipeData.name);
  });

  it('deve atualizar a receita', async () => {
    const update = {
      ...recipeData,
      name: 'Bolo E2E Atualizado',
    };

    const res = await request(app.getHttpServer())
      .put(`/recipes/${recipeId}`)
      .send(update);

    expect(res.status).toBe(HttpStatus.OK);
    expect(res.body).toHaveProperty('name', update.name);
  });

  it('deve imprimir a receita em PDF', async () => {
    const res = await request(app.getHttpServer())
      .get(`/recipes/${recipeId}/print`)
      .expect(HttpStatus.OK);

    expect(res.header['content-type']).toBe('application/pdf');
    expect(res.header['content-disposition']).toContain(`filename=receita-${recipeId}.pdf`);
    expect(res.body).toBeInstanceOf(Buffer);
  });

  it('deve deletar a receita', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/recipes/${recipeId}`);

    expect(res.status).toBe(HttpStatus.NO_CONTENT);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });
});
