import { Injectable, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LoginUserUseCase {
    private firebaseApiKey: string;

    constructor(
        private configService: ConfigService,
    ) {
        this.firebaseApiKey = this.configService.get<string>('FIREBASE_API_KEY');
    }

    async execute(email: string, password: string) {
        try {
          const response = await axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.firebaseApiKey}`,
            {
              email,
              password,
              returnSecureToken: true,
            },
          );
    
          return response.data;
        } catch (error) {
            throw new UnauthorizedException('authorization.invalid.email.or.password');
          }
    }
}