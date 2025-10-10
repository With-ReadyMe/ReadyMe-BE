import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { ErrorCode, TErrorCode } from '../exception/error-code';

@Injectable()
export class CustomValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    // 메타데이터에 타입이 없으면 검증하지 않음
    if (!metadata.metatype || !this.toValidate(metadata.metatype)) {
      return value;
    }

    // DTO 클래스의 인스턴스로 변환
    const object = plainToInstance(metadata.metatype, value);

    // class-validator를 사용하여 유효성 검증
    const errors = await validate(object);

    // 에러가 없으면 값 반환
    if (errors.length === 0) {
      return object;
    }

    // 에러가 있으면 적절한 에러 코드와 메시지로 예외 발생
    throw this.createValidationException(errors);
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private createValidationException(
    errors: ValidationError[],
  ): BadRequestException {
    // 첫 번째 에러의 제약 조건 키를 기반으로 에러 코드 결정
    const errorCode = this.getErrorCodeByConstraints(errors[0]);

    // 모든 에러 메시지 수집
    const errorMessages = this.getErrorMessages(errors);

    // 에러 응답 객체 생성
    const errorResponse = {
      code: errorCode,
      message: errorMessages.join(' '),
      errors: this.formatErrors(errors),
    };

    return new BadRequestException(errorResponse);
  }

  private getErrorCodeByConstraints(error: ValidationError): TErrorCode {
    if (!error.constraints) {
      return ErrorCode.ERROR;
    }

    const constraintKeys = Object.keys(error.constraints);

    // 필수 값 누락
    if (constraintKeys.includes('isNotEmpty')) {
      return ErrorCode.NOT_REQUIRED;
    }

    // 형식 오류 (matches, length, isString 등)
    if (
      constraintKeys.some((key) =>
        [
          'matches',
          'length',
          'isString',
          'isNumber',
          'isBoolean',
          'isArray',
          'isObject',
          'isEmail',
          'isIn',
          'min',
          'max',
        ].includes(key),
      )
    ) {
      return ErrorCode.NOT_VALIDITY;
    }

    // 기타 오류
    return ErrorCode.ERROR;
  }

  private getErrorMessages(errors: ValidationError[]): string[] {
    const messages: string[] = [];

    for (const error of errors) {
      if (error.constraints) {
        messages.push(...Object.values(error.constraints));
      }
    }

    return messages;
  }

  private formatErrors(errors: ValidationError[]): Record<string, string> {
    const result: Record<string, string> = {};

    for (const error of errors) {
      if (error.constraints) {
        result[error.property] = Object.values(error.constraints).join(' ');
      }
    }

    return result;
  }
}
