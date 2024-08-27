import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule as MongooseModuleLib } from "@nestjs/mongoose";
import { PlanSchema } from "./schemas/plan.schema";
import { AmenitySchema } from "./schemas/amenity.schema";
import { BulkUpdateDateSchema } from "./schemas/bulk-update-date.schema";
import { AdvertisementReportSchema } from "./schemas/advertisement-report.schema";
import { AdvertisementReasonSchema } from "./schemas/advertisement-reason.schema";
import { AdvertisementCodeSchema } from "./schemas/advertisement-code.schema";
import { UserSchema } from "./schemas/user.schema";
import { Account, AccountSchema } from "./entities/account.entity";
import { AdvertisementSchema } from "./schemas/advertisement.schema";
import { PayUConfirmationSchema } from "./schemas/payu.schema";
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
          { name: 'AdvertisementCode', schema: AdvertisementCodeSchema },
          { name: 'AdvertisementReason', schema: AdvertisementReasonSchema },
          { name: 'AdvertisementReport', schema: AdvertisementReportSchema },
          { name: 'Advertisement', schema: AdvertisementSchema },
          { name: 'Amenity', schema: AmenitySchema },
          { name: 'BulkUpdateDate', schema: BulkUpdateDateSchema },
          { name: 'Plan', schema: PlanSchema },
          { name: 'User', schema: UserSchema },
          { name: 'PayUConfirmation', schema: PayUConfirmationSchema },
      ]),
    ],
    providers: [
      {
        provide: 'IAccountRepository',
        useClass: MongooseAccountRepository,
      }
    ],
    exports: [
      'IAccountRepository',
    ],
})
export class MongooseModule {}