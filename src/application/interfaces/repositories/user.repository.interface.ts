import { Account } from "src/domain/entities/account.interface";
import { AuthenticatedUser } from "src/domain/entities/authenticated-user.interface";
import { User } from "src/domain/entities/user.interface";
import { CreateUserDto } from "src/infraestructure/http/dtos/user/create-user.dto";

export abstract class IUserRepository {
    abstract create(authenticatedUser: AuthenticatedUser, createUserDto: CreateUserDto, accountCreated: Account): Promise<any>
    abstract deleteOne(filter: any): Promise<void>
    abstract find(filter: any): Promise<User[]>
    abstract findOne(filter: any): Promise<User>
    abstract findOneAndUpdate(filter: any, data: any, returnNew?: boolean): Promise<User>
    abstract findById(userId: string): Promise<User>
    

}