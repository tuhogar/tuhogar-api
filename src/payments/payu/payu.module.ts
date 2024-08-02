import { Module } from '@nestjs/common';
import { PayUService } from './payu.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PayUConfirmationSchema } from './interfaces/payu.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'PayUConfirmation', schema: PayUConfirmationSchema }]),],
  providers: [PayUService],
  exports: [PayUService],
})
export class PayUModule {}
