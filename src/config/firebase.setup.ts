import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import * as admin from "firebase-admin";
import { ConfigService } from "@nestjs/config";

let app: admin.app.App = null;
@Injectable()
export class FirebaseAdmin implements OnApplicationBootstrap {
    constructor(private configService: ConfigService) {}
   
    async onApplicationBootstrap() {
        if (!app) {
            const serviceAccount = {
                type: this.configService.get<string>('FIREBASE_TYPE'),
                project_id: this.configService.get<string>('FIREBASE_PROJECT_ID'),
                private_key_id: this.configService.get<string>('FIREBASE_PRIVATE_KEY_ID'),
                private_key: this.configService.get<string>('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
                client_email: this.configService.get<string>('FIREBASE_CLIENT_EMAIL'),
                client_id: this.configService.get<string>('FIREBASE_CLIENT_ID'),
                auth_uri: this.configService.get<string>('FIREBASE_AUTH_URI'),
                token_uri: this.configService.get<string>('FIREBASE_TOKEN_URI'),
                auth_provider_x509_cert_url: this.configService.get<string>('FIREBASE_AUTH_PROVIDER_X509_CERT_URL'),
                client_x509_cert_url: this.configService.get<string>('FIREBASE_CLIENT_X509_CERT_URL'),
                universe_domain: this.configService.get<string>('FIREBASE_UNIVERSE_DOMAIN'),
            };
            app = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
            });
        }
    }
    setup() {
        return app;
    }
}