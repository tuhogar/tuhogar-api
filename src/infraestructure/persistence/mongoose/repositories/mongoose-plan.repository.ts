import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Plan as PlanMongoose } from "../entities/plan.entity"
import { Plan } from "src/domain/entities/plan";
import { IPlanRepository } from "src/application/interfaces/repositories/plan.repository.interface";
import { MongoosePlanMapper } from "../mapper/mongoose-plan.mapper";

export class MongoosePlanRepository implements IPlanRepository {
    constructor(
        @InjectModel(PlanMongoose.name) private readonly planModel: Model<PlanMongoose>,
    ) {}
    
    async find(): Promise<Plan[]> {
        const findQuery = await this.planModel.find();
        return findQuery.map((item) => MongoosePlanMapper.toDomain(item));
    }
    
    async findById(planId: string): Promise<Plan> {
        const findQuery = await this.planModel.findById(planId).exec();

        return MongoosePlanMapper.toDomain(findQuery);
    }
    
    async create(plan: Plan): Promise<Plan> {

        const data = MongoosePlanMapper.toMongoose(plan);
        const entity = new this.planModel({ ...data });
        await entity.save();

        return MongoosePlanMapper.toDomain(entity);
    }
}