import { HttpException } from '@nestjs/common';
import { TErrorCode } from './error-code';

export class GlobalException extends HttpException {
  private errorCode: TErrorCode;
  constructor(message: string, status: number, errorCode: TErrorCode) {
    super(message, status);
    this.errorCode = errorCode;
  }

  public getErrorCode(): TErrorCode {
    return this.errorCode;
  }
}
