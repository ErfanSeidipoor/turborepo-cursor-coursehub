import { IToken } from '@repo/backend-modules-jwt';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const UserId = createParamDecorator(
  (data: never, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();

    const { user } = request as unknown as { user: IToken };
    return (user && user.userId) || undefined;
  },
);
