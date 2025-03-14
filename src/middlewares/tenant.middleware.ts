import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { User } from 'src/entity/user/user.entity';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request & { user?: User }, res: Response, next: NextFunction) {
    if (!req.user || !req.user.tenant) {
      throw new ForbiddenException('Tenant validation failed');
    }
    next();
  }
}
