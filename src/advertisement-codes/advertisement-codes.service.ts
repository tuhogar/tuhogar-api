import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdvertisementCode } from './interfaces/advertisement-codes.interface';

@Injectable()
export class AdvertisementCodesService {
    constructor(
        private configService: ConfigService,
        @InjectModel('AdvertisementCode') private readonly advertisementCodeModel: Model<AdvertisementCode>,
    ) {
    }

    async generate(): Promise<number> {
        const result = await this.advertisementCodeModel.findOneAndUpdate(
            {},
            { $inc: { code: 1 } },
            { new: true, upsert: true }
          ).exec();
      
          return result.code;
    }
}
