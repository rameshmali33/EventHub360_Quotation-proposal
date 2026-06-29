import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // In a real application, the tenant ID should be resolved from the JWT token and not the request body.
    // Assuming the JwtStrategy extracts the tenantId from the payload into request.user.tenantId
    return request.user?.tenantId;
  },
);
