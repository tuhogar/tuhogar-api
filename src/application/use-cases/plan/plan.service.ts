import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Plan } from 'src/domain/entities/plan.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePlanDto } from 'src/infraestructure/http/dtos/plan/create-plan.dto';

@Injectable()
export class PlanService {

    constructor(
        @InjectModel('Plan') private readonly planModel: Model<Plan>,

    ) {}

    async getAll(): Promise<Plan[]> {
        return this.planModel.find();
    }

    async getById(id: string): Promise<Plan> {
        return this.planModel.findOne({ _id: id });
    }

    async create(createPlanDto: CreatePlanDto): Promise<void> {
        await this.planModel.create(createPlanDto);
    }
}