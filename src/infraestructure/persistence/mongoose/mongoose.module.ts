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

@Module({
    imports: [
        MongooseModuleLib.forRootAsync({
            imports: [
              ConfigModule,
            ],
            useFactory: async (configService: ConfigService) => ({
              uri: configService.get<string>('MONGODB_URL'),
            }),
            inject: [ConfigService],
        }),
        MongooseModuleLib.forFeature([
          { name: Account.name, schema: AccountSchema },
          { name: AdvertisementCode.name, schema: AdvertisementCodeSchema },
          { name: AdvertisementReason.name, schema: AdvertisementReasonSchema },
          { name: AdvertisementReport.name, schema: AdvertisementReportSchema },
          { name: Advertisement.name, schema: AdvertisementSchema },
          { name: Amenity.name, schema: AmenitySchema },
          { name: BulkUpdateDate.name, schema: BulkUpdateDateSchema },
          { name: Plan.name, schema: PlanSchema },
          { name: User.name, schema: UserSchema },
          { name: ContractType.name, schema: ContractTypeSchema }
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
      }
    ],
    exports: [
      IAccountRepository,
      IAdvertisementCodeRepository,
      IAdvertisementReasonRepository,
      IAdvertisementReportRepository,
      IAdvertisementRepository,
      IAmenityRepository,
      IBulkUpdateDateRepository,
      IPlanRepository,
      IUserRepository,
      IContractTypeRepository,
    ],
})
export class MongooseModule {}