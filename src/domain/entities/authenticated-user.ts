import { AccountStatus } from "./account";
import { SubscriptionStatus } from "./subscription";
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
    subscriptionId: string;
    subscriptionStatus: SubscriptionStatus;

    constructor(props: AuthenticatedUser) {
      Object.assign(this, props);
    }
  }