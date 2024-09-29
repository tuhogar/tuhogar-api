import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { IContractTypeRepository } from 'src/application/interfaces/repositories/contract-type.repository.interface';

@ValidatorConstraint({ async: true })
@Injectable()
export class ContractTypeIsExistingIdConstraint implements ValidatorConstraintInterface {
  constructor(private readonly contractTypeRepository: IContractTypeRepository,) {}

  async validate(id: string): Promise<boolean> {
    if (!id) return false;
    const contractType = await this.contractTypeRepository.findById(id);
    return !!contractType;
  }

  defaultMessage(args: ValidationArguments): string {
    const object = args.object as any;
    const data = object.id || object.contractTypes?.toString() || 'value';
    return `invalid.contract-type.${data}.does.not.exist`;
  }
}

export function ContractTypeIsExistingId(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: ContractTypeIsExistingIdConstraint,
    });
  };
}
