import { Injectable } from '@nestjs/common';
import { cloudinary } from '../cloudinary.config';

@Injectable()
export class ImageUploadService {
  async uploadBase64Image(base64: string, type: string, name: string, folder: string) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        `data:${type};base64,${base64}`,
        { folder, public_id: name },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.url);
          }
        },
      );
    });
  }

  async uploadImageBuffer(buffer: Buffer, type: string, imageName: string, folder: string) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder, public_id: imageName },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.url);
          }
        }
      ).end(buffer);
    });
  }

  async deleteImage(publicId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }
}
