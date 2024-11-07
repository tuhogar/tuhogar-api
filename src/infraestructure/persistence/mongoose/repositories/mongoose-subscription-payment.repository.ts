import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SubscriptionPayment } from 'src/domain/entities/subscription-payment';
import { ISubscriptionPaymentRepository } from 'src/application/interfaces/repositories/subscription-payment.repository.interface';
import { SubscriptionPayment as SubscriptionPaymentMongoose } from '../entities/subscription-payment.entity';
import { MongooseSubscriptionPaymentMapper } from '../mapper/mongoose-subscription-payment.mapper';

@Injectable()
export class MongooseSubscriptionPaymentRepository implements ISubscriptionPaymentRepository {
  constructor(
    @InjectModel(SubscriptionPaymentMongoose.name) private readonly subscriptionPaymentModel: Model<SubscriptionPaymentMongoose>,
  ) {}
    
  async create(subscriptionPayment: SubscriptionPayment): Promise<SubscriptionPayment> {
    const data = MongooseSubscriptionPaymentMapper.toMongoose(subscriptionPayment);
    const entity = new this.subscriptionPaymentModel({ ...data });
    await entity.save();

    return MongooseSubscriptionPaymentMapper.toDomain(entity);
  }

  async findByExternalId(externalId: string): Promise<SubscriptionPayment> {
    const query = await this.subscriptionPaymentModel.findOne({ externalId }).exec();
    
    return MongooseSubscriptionPaymentMapper.toDomain(query);
  }

  async find(): Promise<SubscriptionPayment[]> {
    const query = await this.subscriptionPaymentModel.find();
    return query.map((item) => MongooseSubscriptionPaymentMapper.toDomain(item));
  }

  async update(id: string, subscriptionPayment: SubscriptionPayment): Promise<SubscriptionPayment> {
    const updated = await this.subscriptionPaymentModel.findByIdAndUpdate(
      id,
      subscriptionPayment,
      { new: true },
    ).exec();
    
    if (updated) {
      return MongooseSubscriptionPaymentMapper.toDomain(updated);
    }

    return null;
  }
}
