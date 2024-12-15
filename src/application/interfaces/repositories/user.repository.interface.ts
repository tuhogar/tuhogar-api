import { Account } from "src/domain/entities/account";
import { AuthenticatedUser } from "src/domain/entities/authenticated-user";
import { User, UserRole, UserStatus } from "src/domain/entities/user";
import { CreateUserDto } from "src/infraestructure/http/dtos/user/create-user.dto";

export abstract class IUserRepository {
    abstract create(user: User): Promise<User>
    abstract delete(id: string): Promise<void>
    abstract findByAccountIdAndUserRole(accountId: string, userRole?: UserRole): Promise<User[]>
    abstract findOneByUid(uid: string): Promise<User>
    abstract update(id: string, name: string, phone: string, whatsApp: string): Promise<User>
    abstract updateStatus(id: string, status: UserStatus): Promise<User>
    abstract addFavoriteAdvertisement(id: string, advertisementId: string): Promise<User>
    abstract deleteFavoriteAdvertisement(id: string, advertisementId: string): Promise<User>
    abstract findOneById(id: string): Promise<User>
    abstract findByAccountId(accountId: string): Promise<User[]>
    

}