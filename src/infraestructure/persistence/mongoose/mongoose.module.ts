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
import { PayUConfirmationSchema } from "./entities/payu.entity";
import { IAccountRepository } from "src/application/interfaces/repositories/account.repository.interface";
import { MongooseAccountRepository } from "./repositories/mongoose-account.repository";

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
          { name: 'PayUConfirmation', schema: PayUConfirmationSchema },
      ]),
    ],
    providers: [
      {
        provide: IAccountRepository,
        useClass: MongooseAccountRepository,
      }
    ],
    exports: [
      IAccountRepository,
    ],
})
export class MongooseModule {}