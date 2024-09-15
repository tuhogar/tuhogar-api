import { Plan } from "src/domain/entities/plan.interface";
import { CreatePlanDto } from "src/infraestructure/http/dtos/plan/create-plan.dto";

export abstract class IPlanRepository {
    abstract find(): Promise<Plan[]>
    abstract findById(id: string): Promise<Plan>
    abstract create(createPlanDto: CreatePlanDto): Promise<void>
}