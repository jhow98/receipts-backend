import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { MetricsService } from '../src/common/metrics/metrics.service';

describe('User E2E - /users', () => {
  let app: INestApplication;
  let createdUserId: number;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(MetricsService)
    .useValue({
      incrementarUsuariosBuscados: () => {},
      incrementarUsuariosListados: () => {},
      incrementarUsuariosCriados: () => {},
      incrementarUsuariosDeletados: () => {},
    })
    .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  it('deve criar um usuário', async () => {
    const uniqueLogin = `teste.e2e.${Date.now()}`;
    const user = { name: 'Teste E2E', login: uniqueLogin, password: '123456' };
    const res = await request(app.getHttpServer())
      .post('/users')
      .send(user);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    createdUserId = res.body.id;
  });

  it('deve buscar o usuário criado', async () => {
    const res = await request(app.getHttpServer())
      .get(`/users/${createdUserId}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', createdUserId);
    expect(res.body).toHaveProperty('login');
  });

  it('deve listar todos os usuários (inclusive o criado)', async () => {
    const res = await request(app.getHttpServer())
      .get('/users');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: createdUserId })
    ]));
  });

  it('deve deletar o usuário', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/users/${createdUserId}`);

    expect(res.status).toBe(204);
  });

  it('deve retornar 404 após deletar', async () => {
    const res = await request(app.getHttpServer())
      .get(`/users/${createdUserId}`);

    expect(res.status).toBe(404);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });
});
