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

  async findOneByExternalId(externalId: string): Promise<SubscriptionPayment> {
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

  /**
   * Busca todos os pagamentos relacionados a uma assinatura, ordenados por data de pagamento (mais recentes primeiro)
   * @param subscriptionId ID da assinatura
   * @returns Array de pagamentos da assinatura
   */
  async findAllBySubscriptionId(subscriptionId: string): Promise<SubscriptionPayment[]> {
    const query = await this.subscriptionPaymentModel.find({ subscriptionId })
      .sort({ paymentDate: -1 }) // Ordenar por data de pagamento (mais recentes primeiro)
      .exec();
    
    return query.map(item => MongooseSubscriptionPaymentMapper.toDomain(item));
  }

  /**
   * Busca todos os pagamentos de uma conta com paginação, ordenados por data de criação (mais recentes primeiro)
   * @param accountId ID da conta do usuário
   * @param page Número da página (começando em 1)
   * @param limit Quantidade de itens por página
   * @returns Objeto contendo array de pagamentos e contagem total
   */
  async findAllByAccountIdPaginated(accountId: string, page: number, limit: number): Promise<{ data: SubscriptionPayment[], count: number }> {
    // Calcular o número de documentos a pular com base na página e limite
    const skip = (page - 1) * limit;
    
    // Buscar os pagamentos com paginação
    const query = await this.subscriptionPaymentModel.find({ accountId })
      .sort({ createdAt: -1 }) // Ordenar por data de criação (mais recentes primeiro)
      .skip(skip)
      .limit(limit)
      .exec();
    
    // Contar o total de documentos para a propriedade count
    const count = await this.subscriptionPaymentModel.countDocuments({ accountId }).exec();
    
    // Mapear os resultados para o domínio
    const data = query.map(item => MongooseSubscriptionPaymentMapper.toDomain(item));
    
    return { data, count };
  }
}
