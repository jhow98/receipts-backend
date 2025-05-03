import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { Category } from '../src/modules/categories/entities/category.entity';
import { AuthGuard } from '@nestjs/passport';

/**
 * E2E tests for RecipeController
 * - AuthGuard is overridden to mock req.user.id
 * - categoryId is set in recipeData
 * - Tests cover create, read, update, print and delete
 */
describe('RecipeController (e2e)', () => {
  let app: INestApplication;
  let server: any;
  let recipeId: number;
  let userToken: string;
  let categoryId: number;

  const timestamp = Date.now();
  const recipeData = {
    name: 'Dipirona Monoidratada 500mg/mL',
    preparation_time_minutes: 5,
    servings: 1,
    preparation_method: 'Diluir em solução aquosa antes de aplicar.',
    ingredients: 'Dipirona, água destilada',
    categoryId: 0,  // will be overwritten
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // Override JWT AuthGuard to inject req.user
      .overrideGuard(AuthGuard('jwt'))
      .useValue({
        canActivate: (context) => {
          const req = context.switchToHttp().getRequest();
          req.user = { id: 1 };
          return true;
        }
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer();

    // create category and assign its id
    const ds = moduleFixture.get<DataSource>(DataSource);
    const catRepo = ds.getRepository(Category);
    const category = catRepo.create({ name: 'Medicamentos E2E' });
    const savedCat = await catRepo.save(category);
    categoryId = savedCat.id;
    recipeData.categoryId = categoryId;

    // create user and login to get token
    const login = `usuario.e2e.${timestamp}`;
    const password = 'senha123';
    await request(server)
      .post('/users')
      .send({ name: 'Usuário E2E', login, password });

    const loginRes = await request(server)
      .post('/auth/login')
      .send({ login, password });
    expect(loginRes.status).toBe(HttpStatus.OK);
    userToken = loginRes.body.access_token ?? loginRes.body.accessToken;
  });

  it('deve criar uma receita', async () => {
    const res = await request(server)
      .post('/recipes')
      .set('Authorization', `Bearer ${userToken}`)
      .send(recipeData);

    expect(res.status).toBe(HttpStatus.CREATED);
    expect(res.body).toHaveProperty('id');
    recipeId = res.body.id;
  });

  it('deve buscar a receita', async () => {
    const res = await request(server)
      .get(`/recipes/${recipeId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(HttpStatus.OK);
    expect(res.body).toMatchObject({
      id: recipeId,
      name: recipeData.name,
      categoryId,
      userId: 1,
    });
  });

  it('deve atualizar a receita', async () => {
    const updateData = { ...recipeData, name: 'Dipirona Atualizada' };
    const res = await request(server)
      .put(`/recipes/${recipeId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(updateData);

    expect(res.status).toBe(HttpStatus.OK);
    expect(res.body.name).toBe(updateData.name);
  });

  it('deve imprimir a receita em PDF', async () => {
    const res = await request(server)
      .get(`/recipes/${recipeId}/print`)
      .set('Authorization', `Bearer ${userToken}`)
      .buffer()
      .parse((res, callback) => {
        res.setEncoding('binary');
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => callback(null, Buffer.from(data, 'binary')));
      });

    expect(res.status).toBe(HttpStatus.OK);
    expect(res.header['content-type']).toBe('application/pdf');
    expect(res.header['content-disposition']).toContain(`receita-${recipeId}.pdf`);
  });

  it('deve deletar a receita', async () => {
    const res = await request(server)
      .delete(`/recipes/${recipeId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(HttpStatus.NO_CONTENT);
  });

  afterAll(async () => {
    await app.close();
  });
});
