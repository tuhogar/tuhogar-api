import { Injectable, PipeTransform } from '@nestjs/common';
import { REQUEST_CONTEXT } from '../guards/auth.guard';

@Injectable()
export class StripRequestContextPipe implements PipeTransform {
  transform(value: any) {
    delete value[REQUEST_CONTEXT];
    return value;
  }
}