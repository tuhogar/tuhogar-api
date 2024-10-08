import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription } from 'src/domain/entities/subscription';
import { ISubscriptionRepository } from 'src/application/interfaces/repositories/subscription.repository.interface';
import { Subscription as SubscriptionMongoose } from '../entities/subscription.entity';
import { MongooseSubscriptionMapper } from '../mapper/mongoose-subscription.mapper';

@Injectable()
export class MongooseSubscriptionRepository implements ISubscriptionRepository {
  constructor(
    @InjectModel(SubscriptionMongoose.name) private readonly subscriptionModel: Model<SubscriptionMongoose>,
  ) {}
    
  async create(subscription: Subscription): Promise<Subscription> {
    const data = MongooseSubscriptionMapper.toMongoose(subscription);
    const entity = new this.subscriptionModel({ ...data });
    await entity.save();

    return MongooseSubscriptionMapper.toDomain(entity);
  }

  async findById(id: string): Promise<Subscription> {
    const query = await this.subscriptionModel.findById(id).exec();
    
    return MongooseSubscriptionMapper.toDomain(query);
  }

  async findByAccountId(accountId: string): Promise<Subscription> {
    const query = await this.subscriptionModel.findOne({ accountId }).exec();
    
    return MongooseSubscriptionMapper.toDomain(query);
  }

  async findByIdAndUpdate(id: string, subscription: Subscription): Promise<Subscription> {
    const updated = await this.subscriptionModel.findByIdAndUpdate(id, subscription, {
      new: true,
    }).exec();
    
    if (updated) {
        const user = updated;
        return this.findById(user._id.toString());
    }

    return null;
  }

  async cancel(id: string): Promise<Subscription> {
    const updated = await this.subscriptionModel.findByIdAndUpdate(
      id,
      { status: 'canceled' },
      { new: true },
    ).exec();
    
    if (updated) {
        const user = updated;
        return this.findById(user._id.toString());
    }

    return null;
  }
}
