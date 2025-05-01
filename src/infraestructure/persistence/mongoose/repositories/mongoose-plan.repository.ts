import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Plan as PlanMongoose } from "../entities/plan.entity"
import { Plan } from "src/domain/entities/plan";
import { IPlanRepository } from "src/application/interfaces/repositories/plan.repository.interface";
import { MongoosePlanMapper } from "../mapper/mongoose-plan.mapper";
import { ConfigService } from "@nestjs/config";

export class MongoosePlanRepository implements IPlanRepository {
    private readonly firstSubscriptionPlanId: string;
    constructor(
        @InjectModel(PlanMongoose.name) private readonly planModel: Model<PlanMongoose>,
        private readonly configService: ConfigService,
    ) {
        this.firstSubscriptionPlanId = this.configService.get<string>('FIRST_SUBSCRIPTION_PLAN_ID');
    }
    
    async find(): Promise<Plan[]> {
        const query = await this.planModel.find().sort({ 'price': 1 }).exec();
        return query.map((item) => MongoosePlanMapper.toDomain(item));
    }

    async findNotFreeDays(): Promise<Plan[]> {
        const query = await this.planModel.find({ freeTrialDays: { $exists: false } }).sort({ 'price': 1 }).exec();
        return query.map((item) => MongoosePlanMapper.toDomain(item));
    }

    async findOnlyFreeDays(): Promise<Plan[]> {
        const query = await this.planModel.find({
            $or: [
                { freeTrialDays: { $exists: true } },
                { _id: this.firstSubscriptionPlanId }
            ]
        }).sort({ 'price': 1 }).exec();
        return query.map((item) => MongoosePlanMapper.toDomain(item));
    }
    
    async findOneById(id: string): Promise<Plan> {
        const query = await this.planModel.findById(id).exec();

        return MongoosePlanMapper.toDomain(query);
    }
    
    async create(plan: Plan): Promise<Plan> {
        const data = MongoosePlanMapper.toMongoose(plan);
        const entity = new this.planModel({ ...data });
        await entity.save();

        return MongoosePlanMapper.toDomain(entity);
    }
}