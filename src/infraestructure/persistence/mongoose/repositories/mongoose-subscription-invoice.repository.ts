import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SubscriptionInvoice } from 'src/domain/entities/subscription-invoice';
import { ISubscriptionInvoiceRepository } from 'src/application/interfaces/repositories/subscription-invoice.repository.interface';
import { SubscriptionInvoice as SubscriptionInvoiceMongoose } from '../entities/subscription-invoice.entity';
import { MongooseSubscriptionInvoiceMapper } from '../mapper/mongoose-subscription-invoice.mapper';

@Injectable()
export class MongooseSubscriptionInvoiceRepository implements ISubscriptionInvoiceRepository {
  constructor(
    @InjectModel(SubscriptionInvoiceMongoose.name) private readonly subscriptionInvoiceModel: Model<SubscriptionInvoiceMongoose>,
  ) {}
    
  async create(subscriptionInvoice: SubscriptionInvoice): Promise<SubscriptionInvoice> {
    const data = MongooseSubscriptionInvoiceMapper.toMongoose(subscriptionInvoice);
    const entity = new this.subscriptionInvoiceModel({ ...data });
    await entity.save();

    return MongooseSubscriptionInvoiceMapper.toDomain(entity);
  }

  async findByExternalId(externalId: string): Promise<SubscriptionInvoice> {
    const query = await this.subscriptionInvoiceModel.findById({ externalId }).exec();
    
    return MongooseSubscriptionInvoiceMapper.toDomain(query);
  }

  async find(): Promise<SubscriptionInvoice[]> {
    const query = await this.subscriptionInvoiceModel.find();
    return query.map((item) => MongooseSubscriptionInvoiceMapper.toDomain(item));
  }

  async update(id: string, subscriptionInvoice: SubscriptionInvoice): Promise<SubscriptionInvoice> {
    const updated = await this.subscriptionInvoiceModel.findByIdAndUpdate(
      id,
      subscriptionInvoice,
      { new: true },
    ).exec();
    
    if (updated) {
      return MongooseSubscriptionInvoiceMapper.toDomain(updated);
    }

    return null;
  }
}
