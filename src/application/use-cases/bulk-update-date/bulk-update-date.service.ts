import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BulkUpdateDate } from 'src/domain/entities/bulk-update-date.interface';

@Injectable()
export class BulkUpdateDateService {
    constructor(
        private configService: ConfigService,
        @InjectModel('BulkUpdateDate') private readonly bulkUpdateDateModel: Model<BulkUpdateDate>,
    ) {
    }

    async update(updatedAt: Date): Promise<void> {
        await this.bulkUpdateDateModel.findOneAndUpdate(
            {},
            { updatedAt },
            { new: true, upsert: true }
          ).exec();
    }

    async get(): Promise<BulkUpdateDate> {
        return this.bulkUpdateDateModel.findOne();
    }
}