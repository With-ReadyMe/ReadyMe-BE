// src/core/filter/validation.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { JsonResponse } from '../utils/json-response';
import { ErrorCode, TErrorCode } from '../exception/error-code';

interface ValidationErrorResponse {
  message: string;
  code?: TErrorCode;
  errors?: Record<string, string[]>;
}

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const exceptionResponse =
      exception.getResponse() as ValidationErrorResponse;

    let errorCode: TErrorCode;
    if (exceptionResponse.code !== undefined) {
      errorCode = exceptionResponse.code;
    } else {
      const constraintKeys = Object.keys(exceptionResponse.errors || {});
      errorCode = this.getErrorCodeByConstraints(constraintKeys);
    }

    const errorMessage = exceptionResponse.message;

    const jsonResponse = new JsonResponse();
    jsonResponse.set('code', errorCode);
    jsonResponse.set('message', errorMessage);
    // jsonResponse.set('data', exceptionResponse.errors);

    response.status(400).json(jsonResponse.of());
  }

  private getErrorCodeByConstraints(constraintKeys: string[]): TErrorCode {
    // 필수 값 누락
    if (constraintKeys.includes('isNotEmpty')) {
      return ErrorCode.NOT_REQUIRED;
    }

    // 형식 오류 (matches, length, isString 등)
    const formatKeys = [
      'matches',
      'length',
      'isString',
      'isBoolean',
      'isNumber',
      'isIn',
      'isObject',
      'isEmail',
    ];
    if (constraintKeys.some((key) => formatKeys.includes(key))) {
      return ErrorCode.NOT_VALIDITY;
    }

    // 기타 오류
    return ErrorCode.ERROR;
  }
}
