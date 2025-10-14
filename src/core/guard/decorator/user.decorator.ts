import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export interface UserInfo {
  id: string;
  name: string;
  email: string;
}

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserInfo => {
    const request: Request = ctx.switchToHttp().getRequest();
    return request.user as UserInfo;
  },
);
