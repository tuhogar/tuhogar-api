import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user';
import { DeleteImagesAdvertisementDto } from 'src/infraestructure/http/dtos/advertisement/delete-images-advertisement.dto';
import { CloudinaryService } from 'src/infraestructure/cloudinary/cloudinary.service';
import { IAdvertisementRepository } from 'src/application/interfaces/repositories/advertisement.repository.interface';
import { GetAdvertisementUseCase } from './get-advertisement.use-case';

@Injectable()
export class DeleteImagesAdvertisementUseCase {
    constructor(
        private readonly cloudinaryService: CloudinaryService,
        private readonly getAdvertisementUseCase: GetAdvertisementUseCase,
        private readonly advertisementRepository: IAdvertisementRepository,
    ) {}

    async execute(authenticatedUser: AuthenticatedUser, advertisementId: string, deleteImagesAdvertisementDto: DeleteImagesAdvertisementDto): Promise<void> {
        const advertisement = await this.getAdvertisementUseCase.execute(advertisementId);

        const photos = advertisement.photos;
        if(!photos) return;

        const imageIds = deleteImagesAdvertisementDto.images.map((a) => a.id);
        
        const photosToRemove = photos.filter((a) => imageIds.includes(a.id));
        if(!photosToRemove) return;

        const newPhotos = photos.filter((a) => !imageIds.includes(a.id));

        await this.advertisementRepository.updateForDeletePhotos(authenticatedUser.accountId, advertisementId, newPhotos);

        photosToRemove.forEach(async (a) => {
            await this.cloudinaryService.deleteImage(this.getPublicIdFromImageUrl(a.url));
        });
    }

    private getPublicIdFromImageUrl(imageUrl: string): string {
        const split = imageUrl.split('/');
        return `${split[split.length-2]}/${split[split.length-1].split('.')[0]  }`;
    }
}