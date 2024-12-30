import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription, SubscriptionStatus } from 'src/domain/entities/subscription';
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

  async findOneById(id: string): Promise<Subscription> {
    const query = await this.subscriptionModel.findById(id).exec();
    
    return MongooseSubscriptionMapper.toDomain(query);
  }

  async findOneActiveOrCreatedByAccountId(accountId: string): Promise<Subscription> {
    const query = await this.subscriptionModel.findOne({ accountId, status: { $in: [ SubscriptionStatus.ACTIVE, SubscriptionStatus.CREATED ] } }).sort({ createdAt: -1 }).exec();
    
    return MongooseSubscriptionMapper.toDomain(query);
  }

  async findOneByExternalId(externalId: string): Promise<Subscription> {
    const query = await this.subscriptionModel.findOne({ externalId }).exec();
    
    return MongooseSubscriptionMapper.toDomain(query);
  }

  async findOneByExternalPayerReference(externalPayerReference: string): Promise<Subscription> {
    const query = await this.subscriptionModel.findOne({ externalPayerReference }).exec();
    
    return MongooseSubscriptionMapper.toDomain(query);
  }

  async cancel(id: string): Promise<Subscription> {
    const updated = await this.subscriptionModel.findByIdAndUpdate(
      id,
      { status: SubscriptionStatus.CANCELLED },
      { new: true },
    ).exec();
    
    if (updated) {
      return MongooseSubscriptionMapper.toDomain(updated);
    }

    return null;
  }

  async active(id: string): Promise<Subscription> {
    const updated = await this.subscriptionModel.findByIdAndUpdate(
      id,
      { status: SubscriptionStatus.ACTIVE },
      { new: true },
    ).exec();
    
    if (updated) {
      return MongooseSubscriptionMapper.toDomain(updated);
    }

    return null;
  }

  async updateExternalReferences(id: string, externalId: string, externalPayerReference: string): Promise<Subscription> {
    const updated = await this.subscriptionModel.findByIdAndUpdate(
      id,
      { externalId, externalPayerReference },
      { new: true },
    ).exec();
    
    if (updated) {
      return MongooseSubscriptionMapper.toDomain(updated);
    }

    return null;
  }

  async delete(id: string): Promise<void> {
    await this.subscriptionModel.deleteOne({ _id: id }).exec();
}
}
