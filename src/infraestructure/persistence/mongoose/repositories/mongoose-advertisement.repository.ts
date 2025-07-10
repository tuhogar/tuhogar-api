import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Advertisement as AdvertisementMongoose } from "../entities/advertisement.entity"
import { AdvertisementEvent as AdvertisementEventMongoose } from "../entities/advertisement-event.entity"
import { Advertisement, AdvertisementActivesOrderBy, AdvertisementPhoto, AdvertisementStatus, AdvertisementTransactionType, AdvertisementType } from "src/domain/entities/advertisement";
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

    // TODO: Refatorar
    async create(data: any): Promise<Advertisement> {
        const entity = new this.advertisementModel({ ...data });
        await entity.save();

        return MongooseAdvertisementMapper.toDomain(entity);
    }

    // TODO: Refatorar
    async update(advertisementId: string, update: any): Promise<Advertisement> {
        const updated = await this.advertisementModel.findOneAndUpdate({ 
            _id: advertisementId,
        },
        update,
        { new: true }
        ).exec();

        return MongooseAdvertisementMapper.toDomain(updated);
    }
    
    async findForBulk(accountId: string, lastUpdatedAt: Date): Promise<any[]> {
        const filter: any = {$match: {} };

        if (accountId) {
            filter.$match.accountId = new Types.ObjectId(accountId);
        } else {
            filter.$match.updatedAt = { $gt: lastUpdatedAt };
        }

        filter.$match.status = AdvertisementStatus.ACTIVE;

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

    async transfer(userId: string, accountIdFrom: string, accountIdTo: string): Promise<any> {
        const advertisements = await this.advertisementModel.find({ accountId: accountIdFrom }).exec();
        await this.advertisementModel.updateMany({ 
            accountId: accountIdFrom,
        },
        { 
            accountId: accountIdTo, 
            updatedUserId: userId,
        },
        ).exec();

        return advertisements.map((a) => (a._id.toString()));
    }
    
    async findByAccountIdWithEvents(accountId: string, page: number, limit: number, code: number, transactionType: AdvertisementTransactionType, type: AdvertisementType, externalId: string, status: AdvertisementStatus): Promise<{ data: Advertisement[]; count: number }> {

        const skip = (page - 1) * limit;

        const filter: any = accountId ? { accountId } : {};

        if (code || externalId) {
            filter.$or = [];
            if (code) filter.$or.push({ code });
            if (externalId) filter.$or.push({ externalId });
        }

        if (transactionType) filter.transactionType = transactionType;
        if (type) filter.type = type;
        if (status) filter.status = status;

        const count = await this.advertisementModel.countDocuments(filter).exec();
    
        const advertisements = await this.advertisementModel
            .find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('amenities')
            .populate('communityAmenities')
            .exec();
    
        // Coletar todos os IDs de anúncios
        const advertisementIds = advertisements.map((ad) => ad._id);
    
        // Realizar uma única consulta agregada para todos os anúncios
        const advertisementEventsData = await this.advertisementModel.aggregate([
            { $match: { _id: { $in: advertisementIds } } },
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
                    advertisement: { $first: '$$ROOT' },
                    advertisementEvents: { $push: '$advertisementEvents' }
                }
            }
        ]);
        
        // Criar um mapa para associar eventos aos anúncios
        const eventsMap = new Map<string, any>();
        advertisementEventsData.forEach((data) => {
            eventsMap.set(data._id.toString(), data.advertisementEvents);
        });
    
        // Adicionar eventos aos anúncios
        const advertisementsWithAdvertisementEvents = advertisements.map((advertisement) => {
            const events = eventsMap.get(advertisement._id.toString()) || [];
            return {
                ...JSON.parse(JSON.stringify(advertisement)),
                advertisementEvents: events
            };
        });
    
        return {
            data: advertisementsWithAdvertisementEvents.map((item) => MongooseAdvertisementMapper.toDomain(item)),
            count,
        }
    }
    
    async findAllWithEvents(page: number, limit: number, code: number, transactionType: AdvertisementTransactionType, type: AdvertisementType, externalId: string, status: AdvertisementStatus): Promise<{ data: Advertisement[]; count: number }> {

        const skip = (page - 1) * limit;

        const filter: any = {};

        if (code || externalId) {
            filter.$or = [];
            if (code) filter.$or.push({ code });
            if (externalId) filter.$or.push({ externalId });
        }

        if (transactionType) filter.transactionType = transactionType;
        if (type) filter.type = type;
        if (status) filter.status = status;

        const count = await this.advertisementModel.countDocuments(filter).exec();
    
        const advertisements = await this.advertisementModel
            .find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('amenities')
            .populate('communityAmenities')
            .exec();
    
        // Coletar todos os IDs de anúncios
        const advertisementIds = advertisements.map((ad) => ad._id);
    
        // Realizar uma única consulta agregada para todos os anúncios
        const advertisementEventsData = await this.advertisementModel.aggregate([
            { $match: { _id: { $in: advertisementIds } } },
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
                    advertisement: { $first: '$$ROOT' },
                    advertisementEvents: { $push: '$advertisementEvents' }
                }
            }
        ]);
        
        // Criar um mapa para associar eventos aos anúncios
        const eventsMap = new Map<string, any>();
        advertisementEventsData.forEach((data) => {
            eventsMap.set(data._id.toString(), data.advertisementEvents);
        });
    
        // Adicionar eventos aos anúncios
        const advertisementsWithAdvertisementEvents = advertisements.map((advertisement) => {
            const events = eventsMap.get(advertisement._id.toString()) || [];
            return {
                ...JSON.parse(JSON.stringify(advertisement)),
                advertisementEvents: events
            };
        });
    
        return {
            data: advertisementsWithAdvertisementEvents.map((item) => MongooseAdvertisementMapper.toDomain(item)),
            count,
        }
    }

    async findOneActive(advertisementId: string): Promise<Advertisement> {
        const query = await this.advertisementModel.findOne({ _id: advertisementId, status: AdvertisementStatus.ACTIVE }).populate('amenities').populate('communityAmenities').exec();
        return MongooseAdvertisementMapper.toDomain(query);
    }
    
    async findToApprove(): Promise<Advertisement[]> {
        const query = await this.advertisementModel.find({ status: AdvertisementStatus.WAITING_FOR_APPROVAL }).populate('amenities').populate('communityAmenities').sort({ updatedAt: -1 }).exec();
        return query.map((item) => MongooseAdvertisementMapper.toDomain(item));
    }
    
    async updateStatus(ids: string[], accountId: string, status: AdvertisementStatus, publishedAt: Date, approvingUserId: string): Promise<any> {
        const filter: any = { _id: { $in: ids } };
        if (accountId) filter.accountId = accountId;

        const update: any = { status };
        if (publishedAt) update.publishedAt = publishedAt;
        if (approvingUserId) update.approvingUserId = approvingUserId;

        return this.advertisementModel.updateMany(
            filter,
            update,
            { new: true }
        ).exec();
    }
    
    async updatePhotos(accountId: string, advertisementId: string, photos: AdvertisementPhoto[]): Promise<Advertisement> {
        const update: any = { photos };
        const updated = await this.advertisementModel.findOneAndUpdate(
            { accountId, _id: advertisementId },
            update,
            { new: true }
        ).exec();

        return MongooseAdvertisementMapper.toDomain(updated);
    }

    async createPhotos(accountId: string, advertisementId: string, photos: AdvertisementPhoto[]): Promise<Advertisement> {
        const update: any = { $push: { photos: { $each: photos }}, status: AdvertisementStatus.WAITING_FOR_APPROVAL };
        const updated = await this.advertisementModel.findOneAndUpdate(
            { accountId, _id: advertisementId },
            update,
            { new: true }
        ).exec();

        return MongooseAdvertisementMapper.toDomain(updated);
    }
    
    async deleteMany(ids: string[], accountId: string): Promise<void> {
        const filter: any = { _id: { $in: ids } };

        if (accountId) filter.accountId = accountId;

        await this.advertisementModel.deleteMany(filter).exec();
    }

    async findByIdsAndAccountId(ids: string[], accountId: string): Promise<Advertisement[]> {
        const filter: any = { _id: { $in: ids } };

        if (accountId) filter.accountId = accountId;

        const query = await this.advertisementModel.find(filter).populate('amenities').populate('communityAmenities').exec();
        return query.map((item) => MongooseAdvertisementMapper.toDomain(item));
    }

    async findByIds(ids: string[]): Promise<Advertisement[]> {
        const filter: any = { _id: { $in: ids } };

        const query = await this.advertisementModel.find(filter).populate('amenities').populate('communityAmenities').exec();
        return query.map((item) => MongooseAdvertisementMapper.toDomain(item));
    }

    async findOneById(id: string): Promise<Advertisement> {
        const query = await this.advertisementModel.findOne({ _id: id }).populate('amenities').populate('communityAmenities').exec();
        if (query) {
            const advertisementEvents = await this.advertisementEventModel.find({ advertisementId: query.id }).exec();
            if (advertisementEvents) {
                query.advertisementEvents = advertisementEvents;
            }
        }
        return MongooseAdvertisementMapper.toDomain(query);
    }

    async findWithReports(): Promise<Advertisement[]> {
        const query = await this.advertisementModel.aggregate([
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

        return query.map((item) => MongooseAdvertisementMapper.toDomain(item));
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

    async countActiveOrWaitingByAccountId(accountId: string): Promise<number> {
        const count = await this.advertisementModel.countDocuments({
            accountId: new Types.ObjectId(accountId),
            status: { $in: [AdvertisementStatus.ACTIVE, AdvertisementStatus.WAITING_FOR_APPROVAL] }
        }).exec();

        return count;
    }

    /**
     * Busca anúncios ativos ou aguardando aprovação que possuem mais fotos do que o limite permitido
     * @param accountId ID da conta
     * @param maxPhotos Número máximo de fotos permitido pelo plano
     * @returns Lista de anúncios com excesso de fotos
     */
    async findActiveOrWaitingWithExcessPhotos(accountId: string, maxPhotos: number): Promise<Advertisement[]> {
        const advertisements = await this.advertisementModel.find({
            accountId: new Types.ObjectId(accountId),
            status: { $in: [AdvertisementStatus.ACTIVE, AdvertisementStatus.WAITING_FOR_APPROVAL] },
            $expr: { $gt: [{ $size: '$photos' }, maxPhotos] }
        }).exec();

        return advertisements.map(ad => MongooseAdvertisementMapper.toDomain(ad));
    }

    /**
     * Busca anúncios ativos ou aguardando aprovação com ordenação flexível
     * @param accountId ID da conta
     * @param orderBy Campo pelo qual ordenar (ex: 'updatedAt', 'createdAt', 'price')
     * @param orderDirection Direção da ordenação ('asc' para ascendente, 'desc' para descendente)
     * @returns Lista de anúncios ordenados conforme especificado
     */
    async findActiveOrWaitingByAccountIdWithOrder(
        accountId: string, 
        orderBy: string, 
        orderDirection: 'asc' | 'desc'
    ): Promise<Advertisement[]> {
        // Definir a direção da ordenação (1 para ascendente, -1 para descendente)
        const sortDirection = orderDirection === 'asc' ? 1 : -1;
        
        // Criar objeto de ordenação dinâmico
        const sortObj: { [key: string]: 1 | -1 } = {};
        sortObj[orderBy] = sortDirection as 1 | -1;
        
        const advertisements = await this.advertisementModel.find({
            accountId: new Types.ObjectId(accountId),
            status: { $in: [AdvertisementStatus.ACTIVE, AdvertisementStatus.WAITING_FOR_APPROVAL] }
        })
        .sort(sortObj)
        .exec();

        return advertisements.map(ad => MongooseAdvertisementMapper.toDomain(ad));
    }
}