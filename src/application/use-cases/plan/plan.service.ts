import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Plan } from 'src/domain/entities/plan.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePlanDto } from 'src/infraestructure/http/dtos/plan/create-plan.dto';
import { IPlanRepository } from 'src/application/interfaces/repositories/plan.repository.interface';

@Injectable()
export class PlanService {

    constructor(
        private readonly planyRepository: IPlanRepository,
    ) {}

    async getAll(): Promise<Plan[]> {
        return this.planyRepository.getAll();
    }

    async getById(id: string): Promise<Plan> {
        return this.planyRepository.getById(id);
    }

    async create(createPlanDto: CreatePlanDto): Promise<void> {
        await this.planyRepository.create(createPlanDto);
    }
}