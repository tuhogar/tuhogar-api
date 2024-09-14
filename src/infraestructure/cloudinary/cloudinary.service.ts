import { Injectable } from '@nestjs/common';
import { cloudinary } from '../config/cloudinary.config';
import * as sharp from 'sharp';

@Injectable()
export class CloudinaryService {
  async uploadBase64Image(base64: string, type: string, name: string, folder: string): Promise<string> {
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

  async convertToWebP(base64Image: string): Promise<string> {
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const imgBuffer = Buffer.from(base64Data, 'base64');

    const webpBuffer = await sharp(imgBuffer)
        .webp({ quality: 80 })
        .toBuffer();

    return webpBuffer.toString('base64');
  }

  async resizeImage(base64Image: string, maxWidth: number, maxHeight: number): Promise<string> {
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const imgBuffer = Buffer.from(base64Data, 'base64');

    // Obtém as dimensões da imagem
    const metadata = await sharp(imgBuffer).metadata();
    const { width, height } = metadata;

    // Redimensiona a imagem somente se ela for maior que 1920x1080
    if (width > maxWidth || height > maxHeight) {
        const resizedBuffer = await sharp(imgBuffer)
            .resize({ width: maxWidth, height: maxHeight, fit: 'inside' })
            .toBuffer();
        return resizedBuffer.toString('base64');
    }

    // Retorna a imagem original se for menor ou igual ao tamanho máximo
    return base64Image;
  }
}
