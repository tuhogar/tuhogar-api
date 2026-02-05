import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { IBlacklistWordRepository } from 'src/application/interfaces/repositories/blacklist-word.repository.interface';

@ValidatorConstraint({ async: true })
@Injectable()
export class AccountDomainIsNotBlacklistWordConstraint implements ValidatorConstraintInterface {
    constructor(private readonly blacklistWordRepository: IBlacklistWordRepository) {}
    
    async validate(domain: string, args: ValidationArguments) {
        const blacklistWords = await this.blacklistWordRepository.findAll();
        const words = blacklistWords.map(word => word.word);
        
        return !words.includes(domain);
    }

    defaultMessage(args: ValidationArguments) {
        //TODO: incluir na mensagem abaixo o domain
        const domain = args.object['domain'];
       return `invalid.account.domain.is.blacklist.word ${domain}`;
    }
}

export function AccountDomainIsNotBlacklistWord(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: AccountDomainIsNotBlacklistWordConstraint,
        });
    };
}
