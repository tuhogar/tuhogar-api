import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { FirebaseAdmin } from "../config/firebase.setup";
import { AuthenticatedUser } from "src/users/interfaces/authenticated-user.interface";
import { AccountStatus } from "src/accounts/interfaces/account.interface";
import { UserStatus } from "src/users/interfaces/user.interface";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private readonly admin: FirebaseAdmin
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const app = this.admin.setup();
        const request = context.switchToHttp().getRequest();
        const idToken = context.getArgs()[0]?.headers?.authorization?.split(" ")[1];

        if (!idToken) {
            throw new UnauthorizedException();
        }

        const permissions = this.reflector.get<string[]>("permissions", context.getHandler());
        try {
            const claims = await app.auth().verifyIdToken(idToken);
            request['user'] = { 
                userRole: claims.userRole,
                uid: claims.uid,
                userId: claims.userId,
                email: claims.email,
                userStatus: claims.userStatus,
                planId: claims.planId,
                accountId: claims.accountId,
                accountStatus: claims.accountStatus,
            } as AuthenticatedUser;

            if (permissions && permissions.length > 0) {
                if (permissions.includes(claims.userRole) && claims.accountStatus === AccountStatus.ACTIVE && claims.userStatus === UserStatus.ACTIVE) {
                    return true;
                } else {
                    throw new UnauthorizedException();
                }
            }
            return true;
        } catch (error) {
            throw new UnauthorizedException();
        }
    }
}