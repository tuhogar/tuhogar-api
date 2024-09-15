import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Advertisement as AdvertisementMongoose } from "../entities/advertisement.entity"
import { Advertisement, AdvertisementActivesOrderBy, AdvertisementPhoto, AdvertisementStatus } from "src/domain/entities/advertisement.interface";
import { IPlanRepository } from "src/application/interfaces/repositories/plan.repository.interface";
import { CreatePlanDto } from "src/infraestructure/http/dtos/plan/create-plan.dto";
import { IAdvertisementRepository } from "src/application/interfaces/repositories/advertisement.repository.interface";
import { AuthenticatedUser } from "src/domain/entities/authenticated-user.interface";
import { CreateUpdateAdvertisementDto } from "src/infraestructure/http/dtos/advertisement/create-update-advertisement.dto";
import { UpdateStatusAdvertisementDto } from "src/infraestructure/http/dtos/advertisement/update-status-advertisement.dto";
import { UpdateStatusAllAdvertisementsDto } from "src/infraestructure/http/dtos/advertisement/update-status-all-advertisement.dto";
import { plainToClass } from "class-transformer";

export class MongooseAdvertisementRepository implements IAdvertisementRepository {
    constructor(
        @InjectModel(AdvertisementMongoose.name) private readonly advertisementModel: Model<AdvertisementMongoose>,
    ) {}

    async findOneAndUpdate(advertisementId: string, accountId: string, update: any): Promise<any> {
        return this.advertisementModel.findOneAndUpdate({ 
            accountId,
            _id: advertisementId
        },
        update,
        { new: true }
        ).exec();
    }
    
    async findForBulk(lastUpdatedAt: Date): Promise<any[]> {
        return this.advertisementModel.find({
            status: AdvertisementStatus.ACTIVE,
            updatedAt: { $gt: lastUpdatedAt },
         })
        .select('code accountId transactionType type constructionType allContentsIncluded isResidentialComplex isPenthouse bedsCount bathsCount parkingCount floorsCount constructionYear socioEconomicLevel isHoaIncluded amenities communityAmenities hoaFee lotArea floorArea price pricePerFloorArea pricePerLotArea propertyTax address updatedAt')
        .lean()
        .exec();
    }
    
    
    async findForActives(advertisementIds: string[], orderBy: AdvertisementActivesOrderBy): Promise<any[]> {
        return this.advertisementModel.find({ _id: { $in: advertisementIds } }).populate('amenities').populate('communityAmenities').sort(orderBy).exec()
    }
    
    async getAllByAccountId(accountId: string): Promise<any[]> {
        return this.advertisementModel.find({ accountId }).sort({ createdAt: -1 }).populate('amenities').populate('communityAmenities').exec();
    }
    
    async getByAccountIdAndId(filter: any): Promise<any> {
        return this.advertisementModel.findOne(filter).populate('amenities').populate('communityAmenities').exec();
    }
    
    async get(advertisementId: string): Promise<any> {
        return this.advertisementModel.findById(advertisementId).populate('amenities').populate('communityAmenities').exec()
    }
    
    async getActive(advertisementId: string): Promise<any> {
        return this.advertisementModel.findOne({ _id: advertisementId, status: AdvertisementStatus.ACTIVE }).populate('amenities').populate('communityAmenities').exec();
    }
    
    async getAllToApprove(): Promise<any[]> {
        return this.advertisementModel.find({ status: AdvertisementStatus.WAITING_FOR_APPROVAL }).populate('amenities').populate('communityAmenities').sort({ updatedAt: -1 }).exec();
    }
    
    async findForUpdateStatus(userId: string, filter: any, updateStatusAdvertisementDto: UpdateStatusAdvertisementDto, publishedAt: any = undefined, approvingUserId: any = undefined): Promise<any> {
        return this.advertisementModel.findOneAndUpdate(
            filter,
            { 
                updatedUserId: userId,
                ...updateStatusAdvertisementDto,
                publishedAt,
                approvingUserId,
            },
            { new: true }
        ).exec();
    }
    
    async updateStatusAll(filter: any, update: any): Promise<any> {
        return this.advertisementModel.updateMany(
            filter,
            update,
            { new: true }
        ).exec();
    }
    
    async updateProcessPhotos(accountId: string, advertisementId: string, newPhotos: AdvertisementPhoto[]): Promise<any> {
        return this.advertisementModel.findOneAndUpdate(
            { accountId, _id: advertisementId },
            { 
                photos: newPhotos,
                status: AdvertisementStatus.WAITING_FOR_APPROVAL,
             },
            { new: true }
        ).exec();
    }
    
    async updateForDeletePhotos(accountId: string, advertisementId: string, newPhotos: AdvertisementPhoto[]): Promise<any> {
        return this.advertisementModel.findOneAndUpdate(
            { accountId, _id: advertisementId },
            { photos: newPhotos },
            { new: true }
        ).exec();
    }
    
    async getRegisteredAdvertisements(period: "week" | "month"): Promise<any[]> {
        let groupId: any;
        if (period === 'week') {
          groupId = {
            year: { $year: '$createdAt' },
            week: { $week: '$createdAt' },
          };
        } else {
          groupId = {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          };
        }
    
        const advertisements = await this.advertisementModel.aggregate([
          {
            $group: {
              _id: groupId,
              count: { $sum: 1 }
            }
          },
          {
            $sort: {
              '_id.year': 1,
              ...(period === 'week' ? { '_id.week': 1 } : { '_id.month': 1 })
            }
          }
        ]);
    
        return advertisements;
    }
    
    async findSimilarDocuments(embedding: number[]): Promise<any[]> {
        return this.advertisementModel.aggregate([
            {
                "$vectorSearch": {
                "queryVector": embedding,
                "path": "plot_embedding",
                "numCandidates": 100,
                "limit": 5,
                "index": "advertisements_vector_index",
                }
            }
            ]).exec();
    }


    async deleteMany(filter: any): Promise<void> {
        await this.advertisementModel.deleteMany(filter).exec();
    }

    async find(filter: any): Promise<any[]> {
        return this.advertisementModel.find(filter).exec()
    }

    async findById(advertisementId: string): Promise<Advertisement> {
        return this.advertisementModel.findById(advertisementId);
    }

    async findOne(advertisementId: string, accountId: string): Promise<any> {
        this.advertisementModel.findOne({ _id: advertisementId, accountId })
    }

    async create(data: any): Promise<{ id: string; }> {
        const advertisementCreated = new this.advertisementModel(data);
        await advertisementCreated.save();

        return { id: advertisementCreated._id.toString() };
    }

    async findAllWithReports(): Promise<Advertisement[]> {
        return this.advertisementModel.aggregate([
            {
              $lookup: {
                from: 'advertisement-reports',
                localField: '_id',
                foreignField: 'advertisementId',
                as: 'advertisementReports',
              },
            },
            {
              $match: { 'advertisementReports': { $ne: [] } },
            },
            {
              $sort: { 'advertisementReports._id': -1 },
            },
          ]).exec();
    }
}