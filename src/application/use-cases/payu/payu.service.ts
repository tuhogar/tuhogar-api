import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { createHash } from 'crypto';
import { Model } from 'mongoose';
import { PayUConfirmation } from 'src/domain/entities/payu.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PayUService {
    private apiKey: string;
    private merchantId: string;
    constructor(
        private configService: ConfigService,
        @InjectModel('PayUConfirmation') private readonly payUConfirmationModel: Model<PayUConfirmation>,
    ) {
        this.apiKey = this.configService.get<string>('PAYU_API_KEY');
        this.merchantId = this.configService.get<string>('PAYU_MERCHANT_ID')
    }

    async subscription(data: any): Promise<void> {
        const isValid = this.verifySignature(data);
        if (!isValid) {
          throw new Error('Invalid signature');
        }
        
        const payUConfirmation = await this.payUConfirmationModel.create(data);
        await payUConfirmation.save();
    }
    
    private verifySignature(data: any): boolean {
        const referenceCode = data.reference_sale;
        const currency = data.currency;
        const statePol = data.state_pol;

        const adjustedValue = this.adjustValue(data.value);
        const expectedSignature = this.generateSignature(this.apiKey, this.merchantId, referenceCode, adjustedValue, currency, statePol);

        return data.sign === expectedSignature;
    }

    private adjustValue(value: string) {
        const [integerPart, decimalPart] = value.toString().split('.');
        if (decimalPart && decimalPart.length > 1 && decimalPart[1] === '0') {
          return parseFloat(value).toFixed(1);
        } else {
            return parseFloat(value).toFixed(2);
        }
    }

    private generateSignature(apiKey: string, merchantId: string, referenceSale: string, value: string, currency: string, statePol: string) {
        const signatureString = `${apiKey}~${merchantId}~${referenceSale}~${value}~${currency}~${statePol}`;

        return createHash('md5').update(signatureString).digest('hex');
      }
}
