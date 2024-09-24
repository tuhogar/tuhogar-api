import { AdvertisementReport } from 'src/domain/entities/advertisement-report';
import { AdvertisementReport as AdvertisementReportDocument } from '../entities/advertisement-report.entity';
import * as mongoose from 'mongoose';

export class MongooseAdvertisementReportMapper {
    
    static toDomain(entity: AdvertisementReportDocument): AdvertisementReport {
        if (!entity) return null;
        
        const model = new AdvertisementReport({
            _id: entity._id.toString(),
            id: entity._id.toString(),
            advertisementId: entity.advertisementId?.toString(),
            advertisementReasonId: entity.advertisementReasonId?.toString(),
        });
        return model;
    }

    static toMongoose(advertisementReport: AdvertisementReport) {
        return {
            advertisementId: advertisementReport.advertisementId,
            advertisementReportId: advertisementReport.advertisementReasonId,
        }
    }
}