import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EPaycoService } from './epayco.service';

@Module({
  imports: [ConfigModule],
  providers: [EPaycoService],
  exports: [EPaycoService],
})
export class EPaycoModule {}
