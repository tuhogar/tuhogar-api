import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Plan as PlanMongoose } from "../entities/plan.entity"
import { Plan } from "src/domain/entities/plan.interface";
import { IPlanRepository } from "src/application/interfaces/repositories/plan.repository.interface";
import { CreatePlanDto } from "src/infraestructure/http/dtos/plan/create-plan.dto";

export class MongoosePlanRepository implements IPlanRepository {
    constructor(
        @InjectModel(PlanMongoose.name) private readonly planModel: Model<PlanMongoose>,
    ) {}
    
    async getAll(): Promise<any[]> {
        return this.planModel.find();
    }
    
    async getById(id: string): Promise<any> {
        return this.planModel.findOne({ _id: id }).exec();
    }
    
    async create(createPlanDto: CreatePlanDto): Promise<void> {
        await this.planModel.create(createPlanDto);
    }
}