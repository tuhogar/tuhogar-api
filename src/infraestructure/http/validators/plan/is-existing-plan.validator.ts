import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Plan } from 'src/domain/entities/plan.interface';
import { IPlanRepository } from 'src/application/interfaces/repositories/plan.repository.interface';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsExistingPlanConstraint implements ValidatorConstraintInterface {
  constructor(private readonly planyRepository: IPlanRepository) {}

  async validate(planId: string): Promise<boolean> {
    const plan = await this.planyRepository.getById(planId);
    return !!plan;
  }

  defaultMessage(args: ValidationArguments): string {
    const object = args.object as any;
    return `invalid.plan.${object.planId}.does.not.exist`;
  }
}

export function IsExistingPlan(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsExistingPlanConstraint,
    });
  };
}
