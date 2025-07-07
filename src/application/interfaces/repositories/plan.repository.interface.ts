import { Plan } from "src/domain/entities/plan";

export abstract class IPlanRepository {
    abstract findByIds(ids: string[]): Promise<Plan[]>
    abstract findOneById(id: string): Promise<Plan>
    abstract findNotFreeDays(): Promise<Plan[]>
    abstract findOnlyFreeDays(): Promise<Plan[]>
    abstract create(plan: Plan): Promise<Plan>
}