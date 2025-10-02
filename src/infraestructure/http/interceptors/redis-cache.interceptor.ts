import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, from, of } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import { RedisService } from '../../persistence/redis/redis.service';

@Injectable()
export class RedisCacheInterceptor implements NestInterceptor {
  constructor(private readonly redisService: RedisService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    if (request.method !== 'GET') {
      return next.handle();
    }

    const cacheKey = `advertisements-cache:${request.originalUrl}`;

    return from(this.redisService.get(cacheKey)).pipe(
      mergeMap((cachedData) => {
        if (cachedData) {
          console.log('Retornou do cache: ', cacheKey);
          return of(cachedData);
        }

        return next.handle().pipe(
          tap((data) => {
            this.redisService.set(cacheKey, data);
            console.log('Gravou no cache: ', cacheKey);
          }),
        );
      }),
    );
  }
}
