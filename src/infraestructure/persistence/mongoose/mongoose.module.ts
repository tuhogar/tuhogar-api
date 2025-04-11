import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule as MongooseModuleLib } from "@nestjs/mongoose";
import { Plan, PlanSchema } from "./entities/plan.entity";
import { Amenity, AmenitySchema } from "./entities/amenity.entity";
import { BulkUpdateDate, BulkUpdateDateSchema } from "./entities/bulk-update-date.entity";
import { AdvertisementReport, AdvertisementReportSchema } from "./entities/advertisement-report.entity";
import { AdvertisementReason, AdvertisementReasonSchema } from "./entities/advertisement-reason.entity";
import { AdvertisementCode, AdvertisementCodeSchema } from "./entities/advertisement-code.entity";
import { User, UserSchema } from "./entities/user.entity";
import { Account, AccountSchema } from "./entities/account.entity";
import { Advertisement, AdvertisementSchema } from "./entities/advertisement.entity";
import { IAccountRepository } from "src/application/interfaces/repositories/account.repository.interface";
import { MongooseAccountRepository } from "./repositories/mongoose-account.repository";
import { IAdvertisementCodeRepository } from "src/application/interfaces/repositories/advertisement-code.repository.interface";
import { MongooseAdvertisementCodeRepository } from "./repositories/mongoose-advertisement-code.repository";
import { IAdvertisementReasonRepository } from "src/application/interfaces/repositories/advertisement-reason.repository.interface";
import { MongooseAdvertisementReasonRepository } from "./repositories/mongoose-advertisement-reason.repository";
import { IAdvertisementReportRepository } from "src/application/interfaces/repositories/advertisement-report.repository.interface";
import { MongooseAdvertisementReportRepository } from "./repositories/mongoose-advertisement-report.repository";
import { IAmenityRepository } from "src/application/interfaces/repositories/amenity.repository.interface";
import { MongooseAmenityRepository } from "./repositories/mongoose-amenity.repository";
import { IBulkUpdateDateRepository } from "src/application/interfaces/repositories/bulk-update-date.repository.interface";
import { MongooseBulkUpdateDateRepository } from "./repositories/mongoose-bulk-update-date.repository";
import { IPlanRepository } from "src/application/interfaces/repositories/plan.repository.interface";
import { MongoosePlanRepository } from "./repositories/mongoose-plan.repository";
import { IAdvertisementRepository } from "src/application/interfaces/repositories/advertisement.repository.interface";
import { MongooseAdvertisementRepository } from "./repositories/mongoose-advertisement.repository";
import { IUserRepository } from "src/application/interfaces/repositories/user.repository.interface";
import { MongooseUserRepository } from "./repositories/mongoose-user.repository";
import { MongooseContractTypeRepository } from "./repositories/mongoose-contract-type.repository";
import { IContractTypeRepository } from "src/application/interfaces/repositories/contract-type.repository.interface";
import { ContractType, ContractTypeSchema } from "./entities/contract-type.entity";
import { Subscription, SubscriptionSchema } from "./entities/subscription.entity";
import { ISubscriptionRepository } from "src/application/interfaces/repositories/subscription.repository.interface";
import { MongooseSubscriptionRepository } from "./repositories/mongoose-subscription.repository";
import { ISubscriptionPaymentRepository } from "src/application/interfaces/repositories/subscription-payment.repository.interface";
import { MongooseSubscriptionPaymentRepository } from "./repositories/mongoose-subscription-payment.repository";
import { SubscriptionPayment, SubscriptionPaymentSchema } from "./entities/subscription-payment.entity";
import { ISubscriptionNotificationRepository } from "src/application/interfaces/repositories/subscription-notification.repository.interface";
import { MongooseSubscriptionNotificationRepository } from "./repositories/mongoose-subscription-notification.repository";
import { SubscriptionNotification, SubscriptionNotificationSchema } from "./entities/subscription-notification.entity";
import { ISubscriptionInvoiceRepository } from "src/application/interfaces/repositories/subscription-invoice.repository.interface";
import { MongooseSubscriptionInvoiceRepository } from "./repositories/mongoose-subscription-invoice.repository";
import { SubscriptionInvoice, SubscriptionInvoiceSchema } from "./entities/subscription-invoice.entity";
import { IAdvertisementEventRepository } from "src/application/interfaces/repositories/advertisement-event.repository.interface";
import { MongooseAdvertisementEventRepository } from "./repositories/mongoose-advertisement-event.repository";
import { AdvertisementEvent, AdvertisementEventSchema } from "./entities/advertisement-event.entity";
import { AccountAdvertisementStatistics, AccountAdvertisementStatisticsSchema } from "./entities/account-advertisement-statistics.entity";
import { IAccountAdvertisementStatisticsRepository } from "src/application/interfaces/repositories/account-advertisement-statistics.repository.interface";
import { MongooseAccountAdvertisementStatisticsRepository } from "./repositories/mongoose-account-advertisement-statistics.repository";

@Module({
    imports: [
        MongooseModuleLib.forRootAsync({
            imports: [
              ConfigModule,
            ],
            useFactory: async (configService: ConfigService) => ({
              uri: configService.get<string>('MONGODB_URL'),
              maxPoolSize: 10, // 🔹 Número máximo de conexões simultâneas
              serverSelectionTimeoutMS: 5000, // 🔹 Timeout para escolher um servidor
              socketTimeoutMS: 45000, // 🔹 Timeout para operações inativas
            }),
            inject: [ConfigService],
        }),
        MongooseModuleLib.forFeature([
          { name: Account.name, schema: AccountSchema },
          { name: AdvertisementCode.name, schema: AdvertisementCodeSchema },
          { name: AdvertisementEvent.name, schema: AdvertisementEventSchema },
          { name: AdvertisementReason.name, schema: AdvertisementReasonSchema },
          { name: AdvertisementReport.name, schema: AdvertisementReportSchema },
          { name: Advertisement.name, schema: AdvertisementSchema },
          { name: Amenity.name, schema: AmenitySchema },
          { name: BulkUpdateDate.name, schema: BulkUpdateDateSchema },
          { name: Plan.name, schema: PlanSchema },
          { name: User.name, schema: UserSchema },
          { name: ContractType.name, schema: ContractTypeSchema },
          { name: Subscription.name, schema: SubscriptionSchema },
          { name: SubscriptionPayment.name, schema: SubscriptionPaymentSchema },
          { name: SubscriptionInvoice.name, schema: SubscriptionInvoiceSchema },
          { name: SubscriptionNotification.name, schema: SubscriptionNotificationSchema },
          { name: AccountAdvertisementStatistics.name, schema: AccountAdvertisementStatisticsSchema },
      ]),
    ],
    providers: [
      {
        provide: IAccountRepository,
        useClass: MongooseAccountRepository,
      },
      {
        provide: IAdvertisementCodeRepository,
        useClass: MongooseAdvertisementCodeRepository,
      },
      {
        provide: IAdvertisementEventRepository,
        useClass: MongooseAdvertisementEventRepository,
      },
      {
        provide: IAdvertisementReasonRepository,
        useClass: MongooseAdvertisementReasonRepository,
      },
      {
        provide: IAdvertisementReportRepository,
        useClass: MongooseAdvertisementReportRepository,
      },
      {
        provide: IAdvertisementRepository,
        useClass: MongooseAdvertisementRepository,
      },
      {
        provide: IAmenityRepository,
        useClass: MongooseAmenityRepository,
      },
      {
        provide: IBulkUpdateDateRepository,
        useClass: MongooseBulkUpdateDateRepository,
      },
      {
        provide: IPlanRepository,
        useClass: MongoosePlanRepository,
      },
      {
        provide: IUserRepository,
        useClass: MongooseUserRepository,
      },
      {
        provide: IContractTypeRepository,
        useClass: MongooseContractTypeRepository,
      },
      {
        provide: ISubscriptionRepository,
        useClass: MongooseSubscriptionRepository,
      },
      {
        provide: ISubscriptionPaymentRepository,
        useClass: MongooseSubscriptionPaymentRepository,
      },
      {
        provide: ISubscriptionInvoiceRepository,
        useClass: MongooseSubscriptionInvoiceRepository,
      },
      {
        provide: ISubscriptionNotificationRepository,
        useClass: MongooseSubscriptionNotificationRepository,
      },
      {
        provide: IAccountAdvertisementStatisticsRepository,
        useClass: MongooseAccountAdvertisementStatisticsRepository,
      }
    ],
    exports: [
      IAccountRepository,
      IAdvertisementCodeRepository,
      IAdvertisementEventRepository,
      IAdvertisementReasonRepository,
      IAdvertisementReportRepository,
      IAdvertisementRepository,
      IAmenityRepository,
      IBulkUpdateDateRepository,
      IPlanRepository,
      IUserRepository,
      IContractTypeRepository,
      ISubscriptionRepository,
      ISubscriptionPaymentRepository,
      ISubscriptionInvoiceRepository,
      ISubscriptionNotificationRepository,
      IAccountAdvertisementStatisticsRepository,
    ],
})
export class MongooseModule {}