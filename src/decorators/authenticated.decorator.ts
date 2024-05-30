import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from 'src/users/interfaces/authenticated-user.interface';

export const Authenticated = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as AuthenticatedUser;
  },
);