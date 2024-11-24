import { Advertisement, AdvertisementConstructionType, AdvertisementStatus, AdvertisementTransactionType, AdvertisementType } from 'src/domain/entities/advertisement';
import { Advertisement as AdvertisementDocument } from '../entities/advertisement.entity';
import * as mongoose from 'mongoose';
import { MongooseAmenityMapper } from './mongoose-amenity.mapper';
import { Address } from 'src/domain/entities/address';
import { MongooseAddressMapper } from './mongoose-address.mapper';
import { MongooseAdvertisementPhotoMapper } from './mongoose-advertisement-photo.mapper';
import { MongooseAdvertisementEventMapper } from './mongoose-advertisement-event.mapper';
import { AdvertisementEvent } from 'src/domain/entities/advertisement-event';

export class MongooseAdvertisementMapper {
    
    static toDomain(entity: AdvertisementDocument): Advertisement {
        if (!entity) return null;

        let advertisementEvents: AdvertisementEvent[] = undefined;
        if (!!entity.advertisementEvents) {
            advertisementEvents = entity.advertisementEvents.map((a) => MongooseAdvertisementEventMapper.toDomain(a))
        }

        const model = new Advertisement({
            id: entity._id.toString(),
            accountId: entity.accountId?.toString(),
            createdUserId: entity.createdUserId?.toString(),
            updatedUserId: entity.updatedUserId?.toString(),
            approvingUserId: entity.approvingUserId?.toString(),
            status: entity.status as AdvertisementStatus,
            code: entity.code,
            transactionType: entity.transactionType as AdvertisementTransactionType,
            type: entity.type as AdvertisementType,
            constructionType: entity.constructionType as AdvertisementConstructionType,
            allContentsIncluded: entity.allContentsIncluded,
            isResidentialComplex: entity.isResidentialComplex,
            isPenthouse: entity.isPenthouse,
            bedsCount: entity.bedsCount,
            bathsCount: entity.bathsCount,
            parkingCount: entity.parkingCount,
            floorsCount: entity.floorsCount,
            constructionYear: entity.constructionYear,
            socioEconomicLevel: entity.socioEconomicLevel,
            isHoaIncluded: entity.isHoaIncluded,
            amenities: !!entity.amenities ? entity.amenities.map((a) => MongooseAmenityMapper.toDomain(a)) : undefined,
            communityAmenities: !!entity.communityAmenities ? entity.communityAmenities.map((a) => MongooseAmenityMapper.toDomain(a)) : undefined,
            description: entity.description,
            hoaFee: entity.hoaFee,
            lotArea: entity.lotArea,
            floorArea: entity.floorArea,
            price: entity.price,
            pricePerFloorArea: entity.pricePerFloorArea,
            pricePerLotArea: entity.pricePerLotArea,
            propertyTax: entity.propertyTax,
            address: !!entity.address ? MongooseAddressMapper.toDomain(entity.address) : undefined,
            photos: !!entity.photos ? entity.photos.map((a) => MongooseAdvertisementPhotoMapper.toDomain(a)) : undefined,
            tourUrl: entity.tourUrl,
            videoUrl: entity.videoUrl,
            createdAt: entity.createdAt,
            publishedAt: entity.publishedAt,
            updatedAt: entity.updatedAt,
            isVacant: entity.isVacant,
            vacancyDate: entity.vacancyDate,
            externalId: entity.externalId,
            advertisementEvents,
        });
        return model;
    }

    static toMongoose(advertisement: Advertisement) {
        return {
            accountId: advertisement.accountId,
            createdUserId: advertisement.createdUserId,
            updatedUserId: advertisement.updatedUserId,
            approvingUserId: advertisement.approvingUserId,
            status: advertisement.status,
            code: advertisement.code,
            transactionType: advertisement.transactionType,
            type: advertisement.type,
            constructionType: advertisement.constructionType,
            allContentsIncluded: advertisement.allContentsIncluded,
            isResidentialComplex: advertisement.isResidentialComplex,
            isPenthouse: advertisement.isPenthouse,
            bedsCount: advertisement.bedsCount,
            bathsCount: advertisement.bathsCount,
            parkingCount: advertisement.parkingCount,
            floorsCount: advertisement.floorsCount,
            constructionYear: advertisement.constructionYear,
            socioEconomicLevel: advertisement.socioEconomicLevel,
            isHoaIncluded: advertisement.isHoaIncluded,
            amenities: null, //advertisement.amenities,
            communityAmenities: null, //advertisement.communityAmenities,
            description: advertisement.description,
            hoaFee: advertisement.hoaFee,
            lotArea: advertisement.lotArea,
            floorArea: advertisement.floorArea,
            price: advertisement.price,
            pricePerFloorArea: advertisement.pricePerFloorArea,
            pricePerLotArea: advertisement.pricePerLotArea,
            propertyTax: advertisement.propertyTax,
            address: null, //advertisement.address,
            photos: null, //AdvertisementPhoto[],
            tourUrl: advertisement.tourUrl,
            videoUrl: advertisement.videoUrl,
            createddAt: null, //advertisement.createddAt,
            publishedAt: null, //advertisement.publishedAt,
            updatedAt: null, //advertisement.updatedAt,
            isVacant: null, //advertisement.isVacant,
            vacancyDate: null, //advertisement.vacancyDate,
            externalId: advertisement.externalId,
        }
    }
}