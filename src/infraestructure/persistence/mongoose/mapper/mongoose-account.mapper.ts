import { Account, AccountDocumentType, AccountStatus } from 'src/domain/entities/account';
import { Account as AccountDocument } from '../entities/account.entity';
import * as mongoose from 'mongoose';
import { SocialMedia } from 'src/domain/entities/social-media';
import { Address } from 'src/domain/entities/address';
import { MongooseContractTypeMapper } from './mongoose-contract-type.mapper';
import { MongooseAddressMapper } from './mongoose-address.mapper';
import { MongooseSocialMediaMapper } from './mongoose-social-media.mapper';

export class MongooseAccountMapper {
    
    static toDomain(entity: AccountDocument): Account {
        if (!entity) return null;
        
        const model = new Account({
            _id: entity._id.toString(),
            id: entity._id.toString(),
            planId: entity.planId?.toString(),
            photo: entity.photo,
            name: entity.name,
            email: entity.email,
            address: !!entity.address ? MongooseAddressMapper.toDomain(entity.address) : undefined,
            phone: entity.phone,
            whatsApp: entity.whatsApp,
            webSite: entity.webSite,
            socialMedia: !!entity.socialMedia ? MongooseSocialMediaMapper.toDomain(entity.socialMedia) : undefined,
            description: entity.description,
            documentType: entity.documentType as AccountDocumentType,
            documentNumber: entity.documentNumber,
            contractTypes: !!entity.contractTypes ? entity.contractTypes.map((a) => MongooseContractTypeMapper.toDomain(a)) : undefined,
            status: entity.status as AccountStatus,
        });
        return model;
    }

    static toMongoose(account: Account) {
        return {
            planId: account.planId,
            photo: account.photo,
            name: account.name,
            email: account.email,
            address: account.address,
            phone: account.phone,
            whatsApp: account.whatsApp,
            webSite: account.webSite,
            socialMedia: account.socialMedia,
            description: account.description,
            documentType: account.documentType,
            documentNumber: account.documentNumber,
            status: account.status,
        }
    }
}