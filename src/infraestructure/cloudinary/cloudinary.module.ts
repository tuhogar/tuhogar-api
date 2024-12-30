import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configureCloudinary } from '../config/cloudinary.config';

@Module({
  imports: [ConfigModule],
  providers: [
    CloudinaryService,
    {
      provide: 'CLOUDINARY',
      useFactory: (configService: ConfigService) => {
        configureCloudinary(configService);
      },
      inject: [ConfigService],
    }
  ],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
