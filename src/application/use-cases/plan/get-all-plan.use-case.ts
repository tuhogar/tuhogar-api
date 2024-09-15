import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Plan } from 'src/domain/entities/plan.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePlanDto } from 'src/infraestructure/http/dtos/plan/create-plan.dto';
import { IPlanRepository } from 'src/application/interfaces/repositories/plan.repository.interface';

@Injectable()
export class GetAllPlanUseCase {

    constructor(
        private readonly planyRepository: IPlanRepository,
    ) {}

    async execute(): Promise<Plan[]> {
        return this.planyRepository.getAll();
    }
}