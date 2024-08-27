import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Amenity } from 'src/domain/entities/amenity.interface';

@Injectable()
export class AmenityService {
    constructor(
        private configService: ConfigService,
        @InjectModel('Amenity') private readonly amenityModel: Model<Amenity>,
    ) {}

    async getAll(): Promise<Amenity[]> {
        return this.amenityModel.find().sort({ name: 1 }).exec();
    }
}