import { Account, AccountDocumentType, AccountStatus } from 'src/domain/entities/account';
import { Account as AccountDocument } from '../entities/account.entity';
import * as mongoose from 'mongoose';
import { SocialMedia } from 'src/domain/entities/social-media';
import { Address } from 'src/domain/entities/address';

export class MongooseAccountMapper {
    
    static toDomain(entity: AccountDocument): Account {
        if (!entity) return null;
        
        const model = new Account({
            id: entity._id.toString(),
            planId: entity.planId?.toString(),
            photo: entity.photo,
            name: entity.name,
            email: entity.email,
            address: entity.address as Address,
            phone: entity.phone,
            whatsApp: entity.whatsApp,
            webSite: entity.webSite,
            socialMedia: entity.socialMedia as SocialMedia,
            description: entity.description,
            documentType: entity.documentType as AccountDocumentType,
            documentNumber: entity.documentNumber,
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