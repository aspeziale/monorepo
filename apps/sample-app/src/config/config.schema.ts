import { baseEnvSchema } from '@aspeziale/common';
import { z } from 'zod';
import {
  MEMCACHED_HOST,
  MEMCACHED_PORT,
  MEMCACHED_TTL,
  MEMCACHED_TTR,
  MEMCACHED_PREFIX,
  MEMCACHED_VERSION,
} from './config.defaults';

const memcachedSchema = z.object({
  MEMCACHED_HOST: z.string().default(MEMCACHED_HOST),
  MEMCACHED_PORT: z
    .preprocess((val) => parseInt(val as string, 10), z.number())
    .default(MEMCACHED_PORT),
  MEMCACHED_TTL: z
    .preprocess((val) => parseInt(val as string, 10), z.number())
    .default(MEMCACHED_TTL),
  MEMCACHED_TTR: z
    .preprocess((val) => parseInt(val as string, 10), z.number())
    .default(MEMCACHED_TTR),
  MEMCACHED_PREFIX: z.string().default(MEMCACHED_PREFIX),
  MEMCACHED_VERSION: z
    .preprocess((val) => parseInt(val as string, 10), z.number())
    .default(MEMCACHED_VERSION),
});

export const envSchema = baseEnvSchema.merge(memcachedSchema);
