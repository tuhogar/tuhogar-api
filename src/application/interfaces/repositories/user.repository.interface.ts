import { Account } from "src/domain/entities/account.interface";
import { AuthenticatedUser } from "src/domain/entities/authenticated-user.interface";
import { Plan } from "src/domain/entities/plan.interface";
import { User, UserRole } from "src/domain/entities/user.interface";
import { CreatePlanDto } from "src/infraestructure/http/dtos/plan/create-plan.dto";
import { CreateUserDto } from "src/infraestructure/http/dtos/user/create-user.dto";
import { PatchUserDto } from "src/infraestructure/http/dtos/user/patch-user.dto";

export abstract class IUserRepository {
    abstract create(authenticatedUser: AuthenticatedUser, createUserDto: CreateUserDto, accountCreated: Account): Promise<any>
    abstract deleteOne(filter: any): Promise<void>
    abstract find(filter: any): Promise<User[]>
    abstract findOne(filter: any): Promise<User>
    abstract patch(filter: any, patchUserDto: PatchUserDto): Promise<any>
    abstract findOneAndUpdate(filter: any, data: any): Promise<User>
    abstract findByIdAndUpdate(userId: string, data: any): Promise<User>
    abstract findById(userId: string): Promise<User>
    

}