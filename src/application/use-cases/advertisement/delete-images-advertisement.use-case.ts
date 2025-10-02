import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user';
import { DeleteImagesAdvertisementDto } from 'src/infraestructure/http/dtos/advertisement/delete-images-advertisement.dto';
import { CloudinaryService } from 'src/infraestructure/cloudinary/cloudinary.service';
import { IAdvertisementRepository } from 'src/application/interfaces/repositories/advertisement.repository.interface';
import { RedisService } from '../../../infraestructure/persistence/redis/redis.service';
import { UserRole } from 'src/domain/entities/user';

@Injectable()
export class DeleteImagesAdvertisementUseCase {
    constructor(
        private readonly cloudinaryService: CloudinaryService,
        private readonly advertisementRepository: IAdvertisementRepository,
        private readonly redisService: RedisService
    ) {}

    async execute(authenticatedUser: AuthenticatedUser, advertisementId: string, deleteImagesAdvertisementDto: DeleteImagesAdvertisementDto): Promise<void> {
        const advertisement = await this.advertisementRepository.findOneById(advertisementId);
        if (!advertisement) throw new Error('notfound.advertisement.do.not.exists');


        if (authenticatedUser.accountId !== advertisement.accountId && authenticatedUser.userRole !== UserRole.MASTER) {
            throw new Error('notfound.advertisement.do.not.exists');
        }

        const photos = advertisement.photos;
        if(!photos) return;

        const imageIds = deleteImagesAdvertisementDto.images.map((a) => a.id);
        
        const photosToRemove = photos.filter((a) => imageIds.includes(a.id));
        if(!photosToRemove) return;

        const newPhotos = photos.filter((a) => !imageIds.includes(a.id));

        await this.advertisementRepository.updatePhotos(authenticatedUser.userRole !== UserRole.MASTER ? authenticatedUser.accountId : advertisement.accountId, advertisementId, newPhotos);

        const updatedAdvertisementForRedis = await this.advertisementRepository.findByIdsAndAccountId([advertisementId], undefined);
        await Promise.all([
            updatedAdvertisementForRedis.map((a) => this.redisService.set(a.id, a)),
            photosToRemove.map((a) => this.cloudinaryService.deleteImage(this.getPublicIdFromImageUrl(a.url))),
            this.redisService.deleteByPattern('advertisements-cache:*'),
        ]);
    }

    private getPublicIdFromImageUrl(imageUrl: string): string {
        const split = imageUrl.split('/');
        return `${split[split.length-2]}/${split[split.length-1].split('.')[0]  }`;
    }
}