import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SubscriptionNotification } from 'src/domain/entities/subscription-notification';
import { ISubscriptionNotificationRepository } from 'src/application/interfaces/repositories/subscription-notification.repository.interface';
import { SubscriptionNotification as SubscriptionNotificationMongoose } from '../entities/subscription-notification.entity';
import { MongooseSubscriptionNotificationMapper } from '../mapper/mongoose-subscription-notification.mapper';

@Injectable()
export class MongooseSubscriptionNotificationRepository implements ISubscriptionNotificationRepository {
  constructor(
    @InjectModel(SubscriptionNotificationMongoose.name) private readonly subscriptionNotificationModel: Model<SubscriptionNotificationMongoose>,
  ) {}
    
  async create(subscriptionNotification: SubscriptionNotification): Promise<SubscriptionNotification> {
    const data = MongooseSubscriptionNotificationMapper.toMongoose(subscriptionNotification);
    const entity = new this.subscriptionNotificationModel({ ...data });
    await entity.save();

    return MongooseSubscriptionNotificationMapper.toDomain(entity);
  }
}
