import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Plan } from './interfaces/plan.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class PlansService {

    constructor(
        @InjectModel('Plan') private readonly planModel: Model<Plan>,

    ) {}

    async getAll(): Promise<Plan[]> {
        return this.planModel.find();
    }

    async getById(id: string): Promise<Plan> {
        return this.planModel.findOne({ _id: id });
    }
}
