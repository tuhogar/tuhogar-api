import { Injectable } from '@nestjs/common';
import { AlgoliaService } from 'src/infraestructure/algolia/algolia.service';
import { CloudinaryService } from 'src/infraestructure/cloudinary/cloudinary.service';
import { IAdvertisementRepository } from 'src/application/interfaces/repositories/advertisement.repository.interface';
import { UpdateImagesOrderAdvertisementDto } from 'src/infraestructure/http/dtos/advertisement/update-images-order-advertisement.dto';
import { RedisService } from '../../../infraestructure/persistence/redis/redis.service';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user';
import { UserRole } from 'src/domain/entities/user';

@Injectable()
export class UpdateImagesOrderAdvertisementUseCase {
    constructor(
        private readonly algoliaService: AlgoliaService,
        private readonly cloudinaryService: CloudinaryService,
        private readonly advertisementRepository: IAdvertisementRepository,
        private readonly redisService: RedisService
    ) {}

    async execute(authenticatedUser: AuthenticatedUser, advertisementId: string, updateImagesOrderAdvertisementDto: UpdateImagesOrderAdvertisementDto): Promise<void> {
        const advertisement = await this.advertisementRepository.findOneById(advertisementId);
        if (!advertisement) throw new Error('notfound.advertisement.do.not.exists');

        if (authenticatedUser.accountId !== advertisement.accountId && authenticatedUser.userRole !== UserRole.MASTER) {
            throw new Error('notfound.advertisement.do.not.exists');
        }

        const photos = advertisement.photos;
    
        for (const image of updateImagesOrderAdvertisementDto.images) {
            const photo = photos.find((a) => a.id === image.id);
            if (!photo) throw new Error(`notfound.advertisement.photo.id.${image.id}.do.not.exists`);
            photo.order = image.order;
        }

        const updatedAdvertisement = await this.advertisementRepository.updatePhotos(authenticatedUser.userRole !== UserRole.MASTER ? authenticatedUser.accountId : advertisement.accountId, advertisementId, photos);

        if (!updatedAdvertisement) throw new Error('notfound.advertisement.do.not.exists');

        await this.algoliaService.delete(updatedAdvertisement.id);
        await this.redisService.delete(updatedAdvertisement.id)
    }

    private getPublicIdFromImageUrl(imageUrl: string): string {
        const split = imageUrl.split('/');
        return `${split[split.length-2]}/${split[split.length-1].split('.')[0]  }`;
    }
}