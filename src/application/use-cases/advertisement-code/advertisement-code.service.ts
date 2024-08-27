import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdvertisementCode } from 'src/domain/entities/advertisement-code.interface';

@Injectable()
export class AdvertisementCodeService {
    constructor(
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