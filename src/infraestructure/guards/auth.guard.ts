import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { FirebaseAdmin } from "../config/firebase.config";
import { AuthenticatedUser } from "src/domain/entities/authenticated-user";
import { AccountStatus } from "src/domain/entities/account";
import { UserRole, UserStatus } from "src/domain/entities/user";

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
        
        /*
        const xSignature = context.getArgs()[0]?.headers?.['x-signature'];
        if (xSignature) {
            const xRequestId = context.getArgs()[0]?.headers?.['x-request-id'];
            const urlParams = new URLSearchParams(window.location.search);
            const dataID = urlParams.get('data.id');

            console.log('-----request');
            console.log(request);
            console.log('-----request');

            console.log('-----xSignature');
            console.log(xSignature);
            console.log('-----xSignature');

            const parts = xSignature.split(',');

            // Initializing variables to store ts and hash
            let ts;
            let hash;

            // Iterate over the values to obtain ts and v1
            parts.forEach(part => {
                // Split each part into key and value
                const [key, value] = part.split('=');
                if (key && value) {
                    const trimmedKey = key.trim();
                    const trimmedValue = value.trim();
                    if (trimmedKey === 'ts') {
                        ts = trimmedValue;
                    } else if (trimmedKey === 'v1') {
                        hash = trimmedValue;
                    }
                }
            });

            // Obtain the secret key for the user/application from Mercadopago developers site
            const secret = 'your_secret_key_here';

            // Generate the manifest string
            const manifest = `id:${dataID};request-id:${xRequestId};ts:${ts};`;

            // Create an HMAC signature
            const hmac = crypto.createHmac('sha256', secret);
            hmac.update(manifest);

            // Obtain the hash result as a hexadecimal string
            const sha = hmac.digest('hex');

            if (sha === hash) {
                // HMAC verification passed
                console.log("HMAC verification passed");
            } else {
                // HMAC verification failed
                console.log("HMAC verification failed");
            }
        }
        */

        const idToken = context.getArgs()[0]?.headers?.authorization?.split(' ')[1];

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
                subscriptionId: claims.subscriptionId,
                subscriptionStatus: claims.subscriptionStatus,
                
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