import { Request, Response } from 'express';
import { Catch, ExceptionFilter, ArgumentsHost, HttpStatus, HttpException } from '@nestjs/common';
import { LoggerService } from '@aspeziale/logger';
import { ExceptionResponse } from './exceptions.interfaces';
import { toExceptionResponse } from './exceptions.utils';

@Catch()
export class ExceptionsFilter implements ExceptionFilter {
  constructor(protected readonly logger: LoggerService) {
    this.logger.setContext(ExceptionsFilter.name);
  }

  protected log(request: Request, exceptionResponse: ExceptionResponse, stack: string): void {
    const { method, url, query, body } = request;
    const { code, message, details } = exceptionResponse;

    this.logger.error(
      message,
      {
        fn: this.catch.name,
        code,
        details: details || [],
        'request.route': `${method} ${url.replace(/\?.*/, '')}`,
        'request.query': query,
        ...(['POST', 'PUT', 'PATCH'].includes(method) ? { 'request.body': body } : {}),
      },
      stack,
    );
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = toExceptionResponse(
      exception instanceof HttpException
        ? exception.getResponse()
        : {
            code: `HTTP.${status}`,
            message: 'Internal Server Error',
          },
      status,
    );

    this.log(request, exceptionResponse, (exception as Error).stack || '');

    response.status(status).json(exceptionResponse);
  }
}
