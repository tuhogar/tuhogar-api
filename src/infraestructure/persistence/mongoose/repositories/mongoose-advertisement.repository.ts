import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Advertisement as AdvertisementMongoose } from "../entities/advertisement.entity"
import { AdvertisementEvent as AdvertisementEventMongoose } from "../entities/advertisement-event.entity"
import { Advertisement, AdvertisementActivesOrderBy, AdvertisementPhoto, AdvertisementStatus } from "src/domain/entities/advertisement";
import { IPlanRepository } from "src/application/interfaces/repositories/plan.repository.interface";
import { CreatePlanDto } from "src/infraestructure/http/dtos/plan/create-plan.dto";
import { IAdvertisementRepository } from "src/application/interfaces/repositories/advertisement.repository.interface";
import { AuthenticatedUser } from "src/domain/entities/authenticated-user";
import { CreateUpdateAdvertisementDto } from "src/infraestructure/http/dtos/advertisement/create-update-advertisement.dto";
import { UpdateStatusAdvertisementDto } from "src/infraestructure/http/dtos/advertisement/update-status-advertisement.dto";
import { UpdateStatusAllAdvertisementsDto } from "src/infraestructure/http/dtos/advertisement/update-status-all-advertisement.dto";
import { plainToClass } from "class-transformer";
import { MongooseAdvertisementMapper } from "../mapper/mongoose-advertisement.mapper";

export class MongooseAdvertisementRepository implements IAdvertisementRepository {
    constructor(
        @InjectModel(AdvertisementMongoose.name) private readonly advertisementModel: Model<AdvertisementMongoose>,
        @InjectModel(AdvertisementEventMongoose.name) private readonly advertisementEventModel: Model<AdvertisementEventMongoose>,
    ) {}

    async findOneAndUpdate(advertisementId: string, accountId: string, update: any): Promise<Advertisement> {
        const updated = await this.advertisementModel.findOneAndUpdate({ 
            accountId,
            _id: advertisementId
        },
        update,
        { new: true }
        ).exec();

        return MongooseAdvertisementMapper.toDomain(updated);
    }
    
    async findForBulk(accountId: string, lastUpdatedAt: Date): Promise<any[]> {
        const filter: any = {
            $match: {
                status: AdvertisementStatus.ACTIVE,
            }
        };

        if (accountId) {
            filter.$match.accountId = new Types.ObjectId(accountId);
        } else {
            filter.$match.updatedAt = { $gt: lastUpdatedAt };
        }

        return this.advertisementModel.aggregate([
            filter,
            {
                $addFields: {
                    _geoloc: {
                        lat: "$address.latitude",
                        lng: "$address.longitude"
                    }
                }
            },
            {
                $lookup: {
                  from: 'accounts',  // Nome da collection de onde os dados serão buscados
                  localField: 'accountId',  // Campo em "advertisements" que referencia "accounts"
                  foreignField: '_id',  // Campo em "accounts" que é relacionado (neste caso, o _id)
                  as: 'accountData'  // Nome do campo onde os dados relacionados serão armazenados
                }
            },
              // Usamos o $unwind para desestruturar o array "accountData" em um objeto simples
            {
                $unwind: "$accountData"
            },
                // Utilizamos $addFields para mover contractTypes para o nível do advertisement
                {
                $addFields: {
                    contractTypes: "$accountData.contractTypes"
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
                    _geoloc: 1,
                    contractTypes: 1,
                }
            }
        ])
        .exec();
    }
    
    async findForActives(advertisementIds: string[]): Promise<Advertisement[]> {
        const query = await this.advertisementModel.find({ _id: { $in: advertisementIds } }).populate('amenities').populate('communityAmenities').exec()
        return query.map((item) => MongooseAdvertisementMapper.toDomain(item));
    }
    
    async getAllByAccountId(accountId: string): Promise<Advertisement[]> {

        const advertisements = await this.advertisementModel.find({ accountId }).sort({ createdAt: -1 }).populate('amenities').populate('communityAmenities').exec();
        

        const advertisementsWithAdvertisementEvents = await Promise.all(
            advertisements.map(async (advertisement) => {
                const advertisementEvents = await this.advertisementModel
                    .aggregate([
                    { $match: { _id: advertisement._id } },
                    {
                        $lookup: {
                            from: 'advertisement-events',
                            localField: '_id',
                            foreignField: 'advertisementId',
                            as: 'advertisementEvents'
                        }
                    },
                    { $unwind: '$advertisementEvents' },
                    { $replaceRoot: { newRoot: { $mergeObjects: ['$advertisementEvents', '$$ROOT'] } } },
                    { $sort: { 'advertisementEvents.createdAt': -1 } },
                    {
                        $group: {
                            _id: '$_id',
                            user: { $first: '$$ROOT' },
                            advertisementEvents: { $push: '$advertisementEvents' }
                        }
                    }
                ]);

                const advertisementEventsJSON = advertisementEvents[0]?.advertisementEvents.map(sub =>
                    JSON.parse(JSON.stringify(sub))
                ) || [];

                advertisement = {
                    ...JSON.parse(JSON.stringify(advertisement)),
                    advertisementEvents: advertisementEventsJSON
                };

               return advertisement;
            })
        )

        return advertisementsWithAdvertisementEvents.map((item) => MongooseAdvertisementMapper.toDomain(item));
    }
    
    async getByAccountIdAndId(filter: any): Promise<Advertisement> {
        const query = await this.advertisementModel.findOne(filter).populate('amenities').populate('communityAmenities').exec();
        if (query) {
            const advertisementEvents = await this.advertisementEventModel.find({ advertisementId: query.id }).exec();
            if (advertisementEvents) {
                query.advertisementEvents = advertisementEvents;
            }
        }
        return MongooseAdvertisementMapper.toDomain(query);
    }
    
    async get(advertisementId: string): Promise<Advertisement> {
        const query = await this.advertisementModel.findById(advertisementId).populate('amenities').populate('communityAmenities').exec();
        return MongooseAdvertisementMapper.toDomain(query);
    }
    
    async getActive(advertisementId: string): Promise<Advertisement> {
        const query = await this.advertisementModel.findOne({ _id: advertisementId, status: AdvertisementStatus.ACTIVE }).populate('amenities').populate('communityAmenities').exec();
        return MongooseAdvertisementMapper.toDomain(query);
    }
    
    async getAllToApprove(): Promise<Advertisement[]> {
        const query = await this.advertisementModel.find({ status: AdvertisementStatus.WAITING_FOR_APPROVAL }).populate('amenities').populate('communityAmenities').sort({ updatedAt: -1 }).exec();
        return query.map((item) => MongooseAdvertisementMapper.toDomain(item));
    }
    
    async findForUpdateStatus(userId: string, filter: any, updateStatusAdvertisementDto: UpdateStatusAdvertisementDto, publishedAt: any = undefined, approvingUserId: any = undefined): Promise<Advertisement> {
        const updated = await this.advertisementModel.findOneAndUpdate(
            filter,
            { 
                updatedUserId: userId,
                ...updateStatusAdvertisementDto,
                publishedAt,
                approvingUserId,
            },
            { new: true }
        ).exec();

        return MongooseAdvertisementMapper.toDomain(updated);
    }
    
    async updateStatusAll(filter: any, update: any): Promise<any> {
        return this.advertisementModel.updateMany(
            filter,
            update,
            { new: true }
        ).exec();
    }
    
    async updateProcessPhotos(accountId: string, advertisementId: string, newPhotos: AdvertisementPhoto[]): Promise<Advertisement> {
        const updated = await this.advertisementModel.findOneAndUpdate(
            { accountId, _id: advertisementId },
            { 
                photos: newPhotos,
                status: AdvertisementStatus.WAITING_FOR_APPROVAL,
             },
            { new: true }
        ).exec();

        return MongooseAdvertisementMapper.toDomain(updated);
    }
    
    async updateForDeletePhotos(accountId: string, advertisementId: string, newPhotos: AdvertisementPhoto[]): Promise<Advertisement> {
        const updated = await this.advertisementModel.findOneAndUpdate(
            { accountId, _id: advertisementId },
            { photos: newPhotos },
            { new: true }
        ).exec();

        return MongooseAdvertisementMapper.toDomain(updated);
    }
    
    async deleteMany(filter: any): Promise<void> {
        await this.advertisementModel.deleteMany(filter).exec();
    }

    async find(filter: any): Promise<Advertisement[]> {
        const query = await this.advertisementModel.find(filter).populate('amenities').populate('communityAmenities').exec();
        return query.map((item) => MongooseAdvertisementMapper.toDomain(item));
    }

    async findById(advertisementId: string): Promise<Advertisement> {
        const query = await this.advertisementModel.findById(advertisementId).populate('amenities').populate('communityAmenities').exec();
        return MongooseAdvertisementMapper.toDomain(query);
    }

    async findOne(advertisementId: string, accountId: string): Promise<Advertisement> {
        const query = await this.advertisementModel.findOne({ _id: advertisementId, accountId }).populate('amenities').populate('communityAmenities').exec();
        return MongooseAdvertisementMapper.toDomain(query);
    }

    async create(data: any): Promise<Advertisement> {
        const advertisementCreated = new this.advertisementModel(data);
        await advertisementCreated.save();

        return this.findById(advertisementCreated._id.toString());
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
}