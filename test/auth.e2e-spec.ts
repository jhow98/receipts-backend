import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import bcrypt from 'bcrypt';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  const timestamp = Date.now();
  const login = `usuario.e2e.${timestamp}`;
  const password = 'senha123';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get(DataSource);

    const hashedPassword = await bcrypt.hash(password, 10);

    await dataSource.query(
      `INSERT INTO users (name, login, password, created_at, updated_at)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      ['Usuário E2E', login, hashedPassword]
    );
  });

  it('deve autenticar e retornar token JWT', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ login, password });

    expect(res.status).toBe(HttpStatus.OK);
    expect(res.body).toHaveProperty('access_token');
    expect(typeof res.body.access_token).toBe('string');
  });

  afterAll(async () => {
    // Remove receitas antes de apagar usuários (integridade referencial)
    await dataSource.query(`
      DELETE FROM recipes 
      WHERE user_id IN (
        SELECT id FROM users WHERE login LIKE 'usuario.e2e%'
      )
    `);
    await dataSource.query(`DELETE FROM users WHERE login LIKE 'usuario.e2e%'`);
    await app.close();
  });
});
