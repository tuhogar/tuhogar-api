import { Module } from '@nestjs/common';
import { ImageUploadService } from './image-upload.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configureCloudinary } from 'src/cloudinary.config';

@Module({
  imports: [ConfigModule],
  providers: [
    ImageUploadService,
    {
      provide: 'CLOUDINARY',
      useFactory: (configService: ConfigService) => {
        configureCloudinary(configService);
      },
      inject: [ConfigService],
    }
  ],
  exports: [ImageUploadService],
})
export class ImageUploadModule {}
