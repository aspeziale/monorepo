import type { z } from 'zod';
import type { BaseWrapper, MemcachedModuleOptions } from '@andreafspeziale/nestjs-memcached';
import type { BaseConfig } from '@aspeziale/common';
import type { envSchema } from './config.schema';

export interface CachedMetaConfig {
  version: number;
  created: Date | string;
}

export type Cached<T = unknown> = BaseWrapper<T> & CachedMetaConfig;

export interface Memcached extends Omit<MemcachedModuleOptions, 'connections'> {
  connections: { host: string; port: number }[];
  version: number;
}

export interface MemcachedConfig {
  memcached: Memcached;
}

export type EnvSchema = z.infer<typeof envSchema>;
export type Config = BaseConfig & MemcachedConfig;
