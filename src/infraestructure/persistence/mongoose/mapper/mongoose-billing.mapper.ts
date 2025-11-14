import { AccountDocumentType } from 'src/domain/entities/account';
import { Billing } from 'src/domain/entities/billing';
import { Billing as BillingDocument } from '../entities/billing.entity';

export class MongooseBillingMapper {
    
    static toDomain(entity: BillingDocument): Billing {
        if (!entity) return null;

        const model = new Billing({
            id: entity._id.toString(),
            accountId: !entity.accountId?.createdAt ? entity.accountId?.toString() : entity.accountId._id.toString(),
            name: entity.name,
            email: entity.email,
            phone: entity.phone,
            address: entity.address,
            documentType: entity.documentType as AccountDocumentType,
            documentNumber: entity.documentNumber,
        });

        return model;
    }

    static toMongoose(billing: Billing) {
        return {
            accountId: billing.accountId,
            name: billing.name,
            email: billing.email,
            address: billing.address,
            phone: billing.phone,
            documentType: billing.documentType,
            documentNumber: billing.documentNumber,
        }
    }
}