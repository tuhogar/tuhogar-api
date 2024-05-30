import { AccountStatus } from "src/accounts/interfaces/account.interface";
import { UserRole, UserStatus } from "./user.interface";

export interface AuthenticatedUser {
    readonly userRole: UserRole;
    readonly uid: string;
    readonly userId: string;
    readonly email: string;
    readonly userStatus: UserStatus;
    readonly planId: string;
    readonly accountId: string;
    readonly accountStatus: AccountStatus;
  }