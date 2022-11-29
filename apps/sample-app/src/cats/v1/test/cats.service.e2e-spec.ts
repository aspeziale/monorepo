import { INestApplication, NotFoundException } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { LoggerModule } from '@aspeziale/logger';
import { MemcachedModule, MemcachedService } from '@andreafspeziale/nestjs-memcached';
import mapConfig, { Config, envSchema } from '../../../config';
import { CatsModule } from '../../cats.module';
import { CatsService } from '../cats.service';

describe('CatsService (spec)', () => {
  let app: INestApplication;
  let memcachedService: MemcachedService;
  let catsService: CatsService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: 'env/.env.test',
          validate: (c) => mapConfig(envSchema.parse(c)),
        }),
        LoggerModule.forRootAsync({
          useFactory: (cs: ConfigService<Config, true>) => cs.get('logger'),
          inject: [ConfigService],
        }),
        MemcachedModule.forRootAsync({
          useFactory: (cs: ConfigService<Config, true>) => cs.get('memcached'),
          inject: [ConfigService],
        }),
        CatsModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();

    memcachedService = app.get(MemcachedService);
    catsService = app.get(CatsService);

    await app.init();
  });

  it('Should return the expected cat', async () => {
    const expectedCat = { id: 1, name: 'Bubi', age: 7 };

    expect(await catsService.getCat(1)).toEqual(expectedCat);
  });

  it('Should return the expected cached cat', async () => {
    const expectedCat = { id: 1, name: 'Bubi', age: 7 };

    expect(await catsService.getCat(1)).toEqual(expectedCat);
  });

  it('Should throw the expected exception', async () => {
    await expect(catsService.getCat(2)).rejects.toThrow(NotFoundException);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await memcachedService.flush();
  });

  afterAll(async () => {
    memcachedService.end();
    await app.close();
  });
});
