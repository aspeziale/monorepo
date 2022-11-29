import { getBaseConfig } from '@aspeziale/common';
import type { Config, EnvSchema } from './config.interfaces';

export * from './config.interfaces';
export * from './config.schema';

export default (e: EnvSchema): Config => ({
  memcached: {
    connections: [{ host: e.MEMCACHED_HOST, port: e.MEMCACHED_PORT }],
    ttl: e.MEMCACHED_TTL,
    ttr: e.MEMCACHED_TTR,
    wrapperProcessor: ({ value, ttl, ttr }) => ({
      content: value,
      ttl,
      ...(ttr ? { ttr } : {}),
      version: e.MEMCACHED_VERSION,
      created: new Date(),
    }),
    keyProcessor: (key) => `${e.MEMCACHED_PREFIX}::V${e.MEMCACHED_VERSION}::${key}`,
    version: e.MEMCACHED_VERSION,
  },
  ...getBaseConfig(e),
});
