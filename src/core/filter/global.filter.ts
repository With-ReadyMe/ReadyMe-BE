import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { getEnvironmentConfig } from '../../config/environment.config';
import { JsonResponse } from '../utils/json-response';
import { GlobalException } from '../exception/global.exception';
import { ErrorCode, TErrorCode } from '../exception/error-code';
import { WinstonLoggerService } from '../interceptors/logging/winston-logger.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly config = getEnvironmentConfig();

  constructor(private readonly logger: WinstonLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // BadRequestException은 ValidationExceptionFilter에서 처리하도록 throw
    if (exception instanceof BadRequestException) {
      throw exception;
    }
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = this.getHttpStatus(exception);
    const message = this.getErrorMessage(exception);
    const stack = this.getErrorStack(exception);

    // 환경 설정에 따른 에러 로깅
    const { logging } = this.config;

    if (status >= 500 && logging.logServerErrors) {
      // 서버 에러 (5xx) - ERROR 레벨
      this.logger.error(
        `🚨 SERVER ERROR: ${request.method} ${request.url} - ${message}`,
        logging.includeErrorStack ? stack : undefined,
        'GlobalExceptionFilter',
      );
    } else if (status >= 400 && logging.logClientErrors) {
      // 클라이언트 에러 (4xx) - WARN 레벨
      this.logger.warn(
        `⚠️  CLIENT ERROR: ${request.method} ${request.url} - ${message}`,
        'GlobalExceptionFilter',
      );
    }

    const jsonResponse = new JsonResponse();

    let errorCode: TErrorCode = ErrorCode.ERROR;
    if (exception instanceof GlobalException) {
      errorCode = exception.getErrorCode();
    }

    jsonResponse.set('code', errorCode);
    jsonResponse.set(
      'message',
      this.isProduction() ? this.getPublicMessage(status) : message,
    );

    response.status(status).json(jsonResponse.of());
  }

  private getHttpStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getErrorMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      return typeof response === 'string'
        ? response
        : (response as any).message;
    }
    if (exception instanceof Error) {
      return exception.message;
    }
    return 'Internal server error';
  }

  private getErrorStack(exception: unknown): string | undefined {
    if (exception instanceof Error) {
      return exception.stack;
    }
    return undefined;
  }

  private isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  private getPublicMessage(status: number): string {
    const messages = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      500: 'Internal Server Error',
    };
    return messages[status] || 'An error occurred';
  }
}
