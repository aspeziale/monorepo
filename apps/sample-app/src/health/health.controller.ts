import { Controller, Get, UseFilters, VERSION_NEUTRAL } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  HealthCheckResult,
  HealthIndicatorResult,
  MicroserviceHealthIndicator,
} from '@nestjs/terminus';
import { Transport } from '@nestjs/microservices';
import type { Config, Memcached } from '../config';
import { HealthCheckExceptionFilter } from './filters';

@ApiTags('healthz')
@Controller({
  path: 'healthz',
  version: VERSION_NEUTRAL,
})
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly microservice: MicroserviceHealthIndicator,
    private readonly configService: ConfigService<Config, true>,
  ) {}

  @Get()
  @HealthCheck()
  @UseFilters(HealthCheckExceptionFilter)
  @ApiOperation({
    summary: 'Health check',
    description: 'Retrieve **Health** status.',
  })
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      (): Promise<HealthIndicatorResult> =>
        this.microservice.pingCheck('memcached', {
          transport: Transport.TCP,
          options: {
            host: this.configService.get<Memcached>('memcached').connections[0]?.host,
            port: this.configService.get<Memcached>('memcached').connections[0]?.port,
          },
        }),
    ]);
  }
}
