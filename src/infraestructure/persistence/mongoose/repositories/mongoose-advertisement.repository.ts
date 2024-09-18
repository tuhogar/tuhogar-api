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
        return this.advertisementModel.aggregate([
            {
                $match: {
                    status: AdvertisementStatus.ACTIVE,
                    updatedAt: { $gt: lastUpdatedAt }
                }
            },
            {
                $addFields: {
                    _geoloc: {
                        lat: "$address.latitude",
                        lng: "$address.longitude"
                    }
                }
            },
            {
                $project: {
                    code: 1,
                    accountId: 1,
                    transactionType: 1,
                    type: 1,
                    constructionType: 1,
                    allContentsIncluded: 1,
                    isResidentialComplex: 1,
                    isPenthouse: 1,
                    bedsCount: 1,
                    bathsCount: 1,
                    parkingCount: 1,
                    floorsCount: 1,
                    constructionYear: 1,
                    socioEconomicLevel: 1,
                    isHoaIncluded: 1,
                    amenities: 1,
                    communityAmenities: 1,
                    hoaFee: 1,
                    lotArea: 1,
                    floorArea: 1,
                    price: 1,
                    pricePerFloorArea: 1,
                    pricePerLotArea: 1,
                    propertyTax: 1,
                    address: 1,
                    updatedAt: 1,
                    _geoloc: 1  // Incluímos o novo campo no retorno
                }
            }
        ])
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
        return this.advertisementModel.findOne({ _id: advertisementId, accountId })
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