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

    delete entity.resultIntegration;

    return MongooseSubscriptionMapper.toDomain(entity);
  }

  async findOneById(id: string): Promise<Subscription> {
    const query = await this.subscriptionModel.findById(id, { resultIntegration: 0 }).exec();
    
    return MongooseSubscriptionMapper.toDomain(query);
  }
  async findOneWithResultIntegrationById(id: string): Promise<Subscription> {
    const query = await this.subscriptionModel.findById(id).exec();
    
    return MongooseSubscriptionMapper.toDomain(query);
  }

  async findOneActiveOrCreatedByAccountId(accountId: string): Promise<Subscription> {
    const query = await this.subscriptionModel.findOne({ accountId, status: { $in: [ SubscriptionStatus.ACTIVE, SubscriptionStatus.CREATED ] } }, { resultIntegration: 0 }).sort({ createdAt: -1 }).exec();
    
    return MongooseSubscriptionMapper.toDomain(query);
  }

  async findOneActiveByAccountId(accountId: string): Promise<Subscription> {
    const query = await this.subscriptionModel.findOne({ accountId, status: SubscriptionStatus.ACTIVE }, { resultIntegration: 0 }).exec();
    
    return MongooseSubscriptionMapper.toDomain(query);
  }

  async findOneByExternalId(externalId: string): Promise<Subscription> {
    const query = await this.subscriptionModel.findOne({ externalId }, { resultIntegration: 0 }).exec();
    
    return MongooseSubscriptionMapper.toDomain(query);
  }

  async findOneByExternalPayerReference(externalPayerReference: string): Promise<Subscription> {
    const query = await this.subscriptionModel.findOne({ externalPayerReference }, { resultIntegration: 0 }).exec();
    
    return MongooseSubscriptionMapper.toDomain(query);
  }

  async cancel(id: string): Promise<Subscription> {
    const updated = await this.subscriptionModel.findByIdAndUpdate(
      id,
      { status: SubscriptionStatus.CANCELLED },
      { new: true, select: { resultIntegration: 0 } },
    ).exec();
    
    if (updated) {
      return MongooseSubscriptionMapper.toDomain(updated);
    }

    return null;
  }

  /**
   * Cancela uma assinatura no gateway de pagamento e define a data efetiva de cancelamento
   * @param id ID da assinatura
   * @param effectiveCancellationDate Data efetiva de cancelamento (quando a assinatura será efetivamente cancelada)
   * @returns Assinatura atualizada
   */
  async cancelOnPaymentGateway(id: string, effectiveCancellationDate: Date): Promise<Subscription> {
    const updated = await this.subscriptionModel.findByIdAndUpdate(
      id,
      { 
        status: SubscriptionStatus.CANCELLED_ON_PAYMENT_GATEWAY,
        effectiveCancellationDate: effectiveCancellationDate
      },
      { new: true, select: { resultIntegration: 0 } },
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
      { new: true, select: { resultIntegration: 0 } },
    ).exec();
    
    if (updated) {
      return MongooseSubscriptionMapper.toDomain(updated);
    }

    return null;
  }

  async pending(id: string): Promise<Subscription> {
    const updated = await this.subscriptionModel.findByIdAndUpdate(
      id,
      { status: SubscriptionStatus.PENDING },
      { new: true, select: { resultIntegration: 0 } },
    ).exec();
    
    if (updated) {
      return MongooseSubscriptionMapper.toDomain(updated);
    }

    return null;
  }

  async updateExternalReferences(id: string, externalId: string, externalPayerReference: string, resultIntegration: Record<string, any>, status: SubscriptionStatus, nextPaymentDate?: Date): Promise<Subscription> {
    const updateData: any = { externalId, externalPayerReference, resultIntegration, status };
    
    // Adicionar nextPaymentDate ao objeto de atualização se fornecido
    if (nextPaymentDate) {
      updateData.nextPaymentDate = nextPaymentDate;
    }
    
    const updated = await this.subscriptionModel.findOneAndUpdate(
      { _id: id },
      updateData,
      { new: true, select: { resultIntegration: 0 } },
    ).exec();
    
    if (updated) {
      return MongooseSubscriptionMapper.toDomain(updated);
    }

    return null;
  }

  async updatePlan(id: string, planId: string): Promise<Subscription> {
    const updated = await this.subscriptionModel.findByIdAndUpdate(
      id,
      { planId },
      { new: true, select: { resultIntegration: 0 } },
    ).exec();
    
    if (updated) {
      return MongooseSubscriptionMapper.toDomain(updated);
    }

    return null;
  }

  async delete(id: string): Promise<void> {
    await this.subscriptionModel.deleteOne({ _id: id }).exec();
  }

  /**
   * Busca assinaturas com status CANCELLED_ON_PAYMENT_GATEWAY e
   * data efetiva de cancelamento menor ou igual à data atual
   * @param currentDate Data atual para comparação
   * @returns Lista de assinaturas que devem ser efetivamente canceladas
   */
  async findSubscriptionsToCancel(currentDate: Date): Promise<Subscription[]> {
    const subscriptions = await this.subscriptionModel.find({
      status: SubscriptionStatus.CANCELLED_ON_PAYMENT_GATEWAY,
      effectiveCancellationDate: { $lte: currentDate }
    }).exec();

    return subscriptions.map(subscription => MongooseSubscriptionMapper.toDomain(subscription));
  }

  /**
   * Atualiza a data de pagamento de uma assinatura
   * @param id ID da assinatura
   * @param paymentDate Data do pagamento
   * @returns Assinatura atualizada
   */
  async updatePaymentDate(id: string, paymentDate: Date): Promise<Subscription> {
    const updated = await this.subscriptionModel.findByIdAndUpdate(
      id,
      { paymentDate },
      { new: true, select: { resultIntegration: 0 } },
    ).exec();
    
    if (updated) {
      return MongooseSubscriptionMapper.toDomain(updated);
    }

    return null;
  }

  /**
   * Atualiza a data do próximo pagamento de uma assinatura
   * @param id ID da assinatura
   * @param nextPaymentDate Data do próximo pagamento
   * @returns Assinatura atualizada
   */
  async updateNextPaymentDate(id: string, nextPaymentDate: Date): Promise<Subscription> {
    const updated = await this.subscriptionModel.findByIdAndUpdate(
      id,
      { nextPaymentDate },
      { new: true, select: { resultIntegration: 0 } },
    ).exec();
    
    if (updated) {
      return MongooseSubscriptionMapper.toDomain(updated);
    }

    return null;
  }

  /**
   * Busca a assinatura mais recente de um usuário pelo ID da conta
   * @param accountId ID da conta do usuário
   * @returns Assinatura mais recente ou null se não existir
   */
  async findMostRecentByAccountId(accountId: string): Promise<Subscription> {
    const query = await this.subscriptionModel.findOne(
      { accountId },
      { resultIntegration: 0, externalId: 0, externalPayerReference: 0 }
    )
    .sort({ createdAt: -1 })
    .exec();
    
    return MongooseSubscriptionMapper.toDomain(query);
  }
}
