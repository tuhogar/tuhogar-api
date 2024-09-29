import { AccountStatus } from "./account";
import { UserRole, UserStatus } from "./user";

export class AuthenticatedUser {
    userRole: UserRole;
    uid: string;
    userId: string;
    email: string;
    userStatus: UserStatus;
    planId: string;
    accountId: string;
    accountStatus: AccountStatus;

    constructor(props: AuthenticatedUser) {
      Object.assign(this, props);
    }
  }