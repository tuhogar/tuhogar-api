import { Plan } from "src/domain/entities/plan";

export abstract class IPlanRepository {
    abstract find(): Promise<Plan[]>
    abstract findById(id: string): Promise<Plan>
    abstract create(data: Plan): Promise<Plan>
}