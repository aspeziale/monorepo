import { INestApplication, NotFoundException } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { LoggerModule } from '@aspeziale/logger';
import { MemcachedModule, MemcachedService } from '@andreafspeziale/nestjs-memcached';
import mapConfig, { Cached, Config, envSchema } from '../../../config';
import { CatsModule } from '../../cats.module';
import type { Cat } from '../cats.interfaces';
import { CatsService } from '../cats.service';

describe('CatsService (spec)', () => {
  let app: INestApplication;
  let configService: ConfigService<Config, true>;
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
          useFactory: (cs: ConfigService<Config, true>) => {
            const { version, ...memcachedConfig } = cs.get('memcached');
            return memcachedConfig;
          },
          inject: [ConfigService],
        }),
        CatsModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();

    configService = app.get(ConfigService);
    memcachedService = app.get(MemcachedService);
    catsService = app.get(CatsService);

    await app.init();
  });

  it('Should return the expected cat', async () => {
    const expectedCat = { id: 1, name: 'Bubi', age: 7 };

    const mockMemcachedGet = jest.spyOn(memcachedService, 'get');
    const mockMemcachedSetWithMeta = jest.spyOn(memcachedService, 'setWithMeta');

    mockMemcachedGet.mockResolvedValueOnce(null);
    mockMemcachedSetWithMeta.mockResolvedValueOnce(true);

    expect(await catsService.getCat(1)).toEqual(expectedCat);

    expect(mockMemcachedGet).toHaveBeenNthCalledWith(1, expectedCat.id.toString());
    expect(mockMemcachedSetWithMeta).toHaveBeenNthCalledWith(
      1,
      expectedCat.id.toString(),
      expectedCat,
    );
  });

  it('Should return the expected cached cat', async () => {
    const expectedCachedCat: Cached<Cat> = {
      content: { id: 1, name: 'Bubi', age: 7 },
      created: new Date().toISOString(),
      ttl: configService.get('memcached').ttl,
      ttr: configService.get('memcached').ttr,
      version: configService.get('memcached').version,
    };

    const mockMemcachedGet = jest.spyOn(memcachedService, 'get');
    const mockMemcachedSetWithMeta = jest.spyOn(memcachedService, 'setWithMeta');

    mockMemcachedGet.mockResolvedValueOnce(expectedCachedCat);

    expect(await catsService.getCat(1)).toEqual(expectedCachedCat.content);

    expect(mockMemcachedGet).toHaveBeenNthCalledWith(1, expectedCachedCat.content.id.toString());
    expect(mockMemcachedSetWithMeta).toHaveBeenCalledTimes(0);
  });

  it('Should throw the expected exception', async () => {
    const catId = 2;

    const mockMemcachedGet = jest.spyOn(memcachedService, 'get');
    const mockMemcachedSet = jest.spyOn(memcachedService, 'setWithMeta');

    jest.spyOn(memcachedService, 'get').mockResolvedValueOnce(null);

    await expect(catsService.getCat(catId)).rejects.toThrow(NotFoundException);

    expect(mockMemcachedGet).toHaveBeenNthCalledWith(1, catId.toString());
    expect(mockMemcachedSet).toHaveBeenCalledTimes(0);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });
});
