import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerMiddleware, LoggerModule } from '@aspeziale/logger';
import { MemcachedModule } from '@andreafspeziale/nestjs-memcached';
import { CatsModule } from '../cats/cats.module';
import mapConfig, { Config, envSchema, Memcached } from '../config';
import { HealthModule } from '../health/health.module';
import { getExceptionsFilterProvider, getValidationPipeProvider } from './core.utils';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (c) => mapConfig(envSchema.parse(c)),
    }),
    LoggerModule.forRootAsync({
      useFactory: (cs: ConfigService<Config, true>) => cs.get('logger'),
      inject: [ConfigService],
    }),
    MemcachedModule.forRootAsync({
      useFactory: (cs: ConfigService<Config, true>) => {
        const { version, ...memcachedModuleOptions } = cs.get<Memcached>('memcached');
        return memcachedModuleOptions;
      },
      inject: [ConfigService],
    }),
    HealthModule,
    CatsModule,
  ],
  providers: [getValidationPipeProvider(), getExceptionsFilterProvider()],
})
export class CoreModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(LoggerMiddleware)
      .exclude('(.*)/healthz', '/swagger(.*)', '/favicon.ico')
      .forRoutes('*');
  }
}
