import { Account } from "src/domain/entities/account";
import { AuthenticatedUser } from "src/domain/entities/authenticated-user";
import { User } from "src/domain/entities/user";
import { CreateUserDto } from "src/infraestructure/http/dtos/user/create-user.dto";

export abstract class IUserRepository {
    abstract create(authenticatedUser: AuthenticatedUser, createUserDto: CreateUserDto, accountCreated: Account): Promise<User>
    abstract deleteOne(id: string): Promise<void>
    abstract find(filter: any): Promise<User[]>
    abstract findOne(filter: any): Promise<User>
    abstract findOneByUid(uid: string): Promise<User>
    abstract findOneAndUpdate(filter: any, data: any, returnNew?: boolean): Promise<User>
    abstract findById(userId: string): Promise<User>
    abstract findByAccountId(accountId: string): Promise<User[]>
    

}