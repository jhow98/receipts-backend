import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { Category } from '../src/modules/categories/entities/category.entity';

describe('RecipeController (e2e)', () => {
  let app: INestApplication;
  let recipeId: number;
  let userId: number;
  let categoryId: number;
  let server: any;

  const timestamp = Date.now();
  const recipeData = {
    name: 'Dipirona Monoidratada 500mg/mL',
    preparation_time_minutes: 5,
    servings: 1,
    preparation_method: 'Diluir em solução aquosa antes de aplicar.',
    ingredients: 'Dipirona, água destilada',
    userId: 0,
    categoryId: 0,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer();

    const dataSource = moduleFixture.get<DataSource>(DataSource);
    const categoryRepository = dataSource.getRepository(Category);
    const category = categoryRepository.create({ name: 'Medicamentos E2E' });
    const savedCategory = await categoryRepository.save(category);
    categoryId = savedCategory.id;

    const userRes = await request(server)
      .post('/users')
      .send({
        name: 'Usuário E2E',
        login: `usuario.e2e.${timestamp}`,
        password: 'senha123',
      });

    userId = userRes.body.id;
    recipeData.userId = userId;
    recipeData.categoryId = categoryId;
  });

  it('deve criar uma receita de medicamento', async () => {
    const res = await request(server)
      .post('/recipes')
      .send(recipeData);
  
    console.log('Resposta criação receita:', res.body);
  
    expect(res.status).toBe(HttpStatus.CREATED);
    expect(res.body).toHaveProperty('id');
  
    recipeId = res.body.id;
  
    if (!recipeId) {
      throw new Error('Receita não foi criada corretamente. ID ausente.');
    }
  });

  it('deve buscar a receita', async () => {
    const res = await request(server)
      .get(`/recipes/${recipeId}`);

    expect(res.status).toBe(HttpStatus.OK);
    expect(res.body.name).toBe(recipeData.name);
  });

  it('deve atualizar a receita', async () => {
    const updateData = {
      ...recipeData,
      name: 'Dipirona Monoidratada Atualizada',
    };

    const res = await request(server)
      .put(`/recipes/${recipeId}`)
      .send(updateData);

    expect(res.status).toBe(HttpStatus.OK);
    expect(res.body.name).toBe(updateData.name);
  });

  it('deve imprimir a receita em PDF', async () => {
    const res = await request(server)
      .get(`/recipes/${recipeId}/print`)
      .expect(HttpStatus.OK);

    expect(res.header['content-type']).toBe('application/pdf');
    expect(res.header['content-disposition']).toContain(`receita-${recipeId}.pdf`);
  });

  it('deve deletar a receita', async () => {
    const res = await request(server)
      .delete(`/recipes/${recipeId}`);

    expect(res.status).toBe(HttpStatus.NO_CONTENT);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });
});
