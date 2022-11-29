import { Provider, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ExceptionsFilter } from '@aspeziale/common';

export const getValidationPipeProvider = (): Provider => ({
  provide: APP_PIPE,
  useFactory: (): ValidationPipe =>
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
});

export const getExceptionsFilterProvider = (): Provider => ({
  provide: APP_FILTER,
  useClass: ExceptionsFilter,
});
