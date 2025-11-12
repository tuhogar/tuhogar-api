import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Billing } from "src/domain/entities/billing";
import { Billing as BillingMongoose } from "../entities/billing.entity"
import { MongooseBillingMapper } from "../mapper/mongoose-billing.mapper";
import { IBillingRepository } from "src/application/interfaces/repositories/billing.repository.interface";
import { AccountDocumentType } from "src/domain/entities/account";

export class MongooseBillingRepository implements IBillingRepository {
    constructor(
        @InjectModel(BillingMongoose.name) private readonly billingModel: Model<BillingMongoose>,
    ) {}
    
    async findOneByAccountId(accountId: string): Promise<Billing> {
      const query = await this.billingModel.findOne({ accountId }).exec();
      return MongooseBillingMapper.toDomain(query);
    }

    async create(billing: Billing): Promise<Billing> {
      const data = MongooseBillingMapper.toMongoose({ ...billing });


        const entity = new this.billingModel({ ...data });
        await entity.save();

        return MongooseBillingMapper.toDomain(entity);
    }

    async update(
      accountId: string,
      name: string,
      email: string,
      phone: string,
      address: string,
      documentType: AccountDocumentType,
      documentNumber: string,
    ): Promise<Billing> {

      const update: any = {};

      if (name !== undefined) update.name = name;
      if (address !== undefined) update.address = address;
      if (phone !== undefined) update.phone = phone;
      if (email !== undefined) update.email = email;
      if (documentType !== undefined) update.documentType = documentType;
      if (documentNumber !== undefined) update.documentNumber = documentNumber;

      const updated = await this.billingModel.findOneAndUpdate(
        { accountId },
        update,
        { new: true },
      ).exec();

      if (updated) {
        return MongooseBillingMapper.toDomain(updated);
      }

      return null;
    }
}