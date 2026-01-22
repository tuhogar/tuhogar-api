import { Account, AccountDocumentType, AccountStatus, AccountType } from 'src/domain/entities/account';
import { Account as AccountDocument } from '../entities/account.entity';
import { MongooseContractTypeMapper } from './mongoose-contract-type.mapper';
import { MongooseAddressMapper } from './mongoose-address.mapper';
import { MongooseSocialMediaMapper } from './mongoose-social-media.mapper';
import { MongooseSubscriptionMapper } from './mongoose-subscription.mapper';
import { Subscription } from 'src/domain/entities/subscription';

export class MongooseAccountMapper {
    
    static toDomain(entity: AccountDocument): Account {
        if (!entity) return null;

        let subscriptions: Subscription[] = undefined;
        let subscription: Subscription = undefined;
        if (!!entity.subscriptions) {
            subscriptions = entity.subscriptions.map((a) => MongooseSubscriptionMapper.toDomain(a))
            if (subscriptions && subscriptions.length) {
                subscription = subscriptions[0];
            }
        }

        const model = new Account({
            id: entity._id.toString(),
            planId: entity.planId?.toString(),
            photo: entity.photo,
            name: entity.name,
            email: entity.email,
            address: !!entity.address ? MongooseAddressMapper.toDomain(entity.address) : undefined,
            phone: entity.phone,
            whatsApp: entity.whatsApp,
            phone2: entity.phone2,
            whatsApp2: entity.whatsApp2,
            webSite: entity.webSite,
            socialMedia: !!entity.socialMedia ? MongooseSocialMediaMapper.toDomain(entity.socialMedia) : undefined,
            description: entity.description,
            documentType: entity.documentType as AccountDocumentType,
            documentNumber: entity.documentNumber,
            contractTypes: !!entity.contractTypes ? entity.contractTypes.map((a) => MongooseContractTypeMapper.toDomain(a)) : undefined,
            subscription,
            subscriptions,
            status: entity.status as AccountStatus,
            hasPaidPlan: entity.hasPaidPlan,
            accountType: entity.accountType ? entity.accountType as AccountType : AccountType.BUYER,
            primaryColor: entity.primaryColor,
            domain: entity.domain,
        });

        return model;
    }

    static toDomainForSubscriptionUpdate(entity: AccountDocument): Account {
        if (!entity) return null;

        const model = new Account({
            id: entity._id.toString(),
            planId: entity.planId?.toString(),
            name: entity.name,
            email: entity.email,
            phone: entity.phone,
            documentType: entity.documentType as AccountDocumentType,
            documentNumber: entity.documentNumber,
            status: entity.status as AccountStatus,
            hasPaidPlan: entity.hasPaidPlan,
            paymentToken: entity.paymentToken,
        });

        return model;
    }

    static toMongoose(account: Account) {
        return {
            planId: account.planId,
            photo: account.photo,
            hasPaidPlan: account.hasPaidPlan,
            name: account.name,
            email: account.email,
            address: account.address,
            phone: account.phone,
            whatsApp: account.whatsApp,
            phone2: account.phone2,
            whatsApp2: account.whatsApp2,
            webSite: account.webSite,
            socialMedia: account.socialMedia,
            description: account.description,
            documentType: account.documentType,
            documentNumber: account.documentNumber,
            status: account.status,
            accountType: account.accountType,
            primaryColor: account.primaryColor,
            domain: account.domain,
        }
    }
}