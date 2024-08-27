import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { FirebaseAdmin } from "../config/firebase.config";
import { AuthenticatedUser } from "src/domain/entities/authenticated-user.interface";
import { AccountStatus } from "src/domain/entities/account.interface";
import { UserRole, UserStatus } from "src/domain/entities/user.interface";

export const REQUEST_CONTEXT = '_requestContext';
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
            const user: AuthenticatedUser = { 
                userRole: claims.userRole,
                uid: claims.uid,
                userId: claims.userId,
                email: claims.email,
                userStatus: claims.userStatus,
                planId: claims.planId,
                accountId: claims.accountId,
                accountStatus: claims.accountStatus,
            };

            request['user'] = user;
            request['body'][REQUEST_CONTEXT] = { user };

            if (permissions && permissions.length > 0) {
                if (permissions.includes(user.userRole) && (user.userRole === UserRole.MASTER || user.accountStatus === AccountStatus.ACTIVE) && user.userStatus === UserStatus.ACTIVE) {
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