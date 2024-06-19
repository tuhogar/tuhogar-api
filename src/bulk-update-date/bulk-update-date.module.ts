import { Module } from '@nestjs/common';
import { BulkUpdateDateService } from './bulk-update-date.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BulkUpdateDateSchema } from './interfaces/bulk-update-date.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'BulkUpdateDate', schema: BulkUpdateDateSchema }]),
  ],
  providers: [BulkUpdateDateService],
  exports: [BulkUpdateDateService],
})
export class BulkUpdateDateModule {}
