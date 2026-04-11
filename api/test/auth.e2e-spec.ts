/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, type TestingModule } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth flow (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('signup -> refresh -> logout', async () => {
    const unique = Date.now();
    const email = `e2e-${unique}@example.com`;
    const organizationName = `E2E Org ${unique}`;

    const signupRes = await request(app.getHttpServer())
      .post('/api/v1/auth/signup')
      .send({
        fullname: 'E2E User',
        email,
        password: 'password12',
        confirmPassword: 'password12',
        organizationName,
      })
      .expect(201);

    const { accessToken, refreshToken } = signupRes.body as {
      accessToken: string;
      refreshToken: string;
    };
    expect(typeof accessToken).toBe('string');
    expect(typeof refreshToken).toBe('string');

    const refreshRes = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    const { accessToken: access2, refreshToken: refresh2 } =
      refreshRes.body as {
        accessToken: string;
        refreshToken: string;
      };
    expect(access2).not.toBe(accessToken);
    expect(refresh2).not.toBe(refreshToken);

    await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${access2}`)
      .send({ refreshToken: refresh2 })
      .expect(204);

    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: refresh2 })
      .expect(401);
  }, 30_000);
});
