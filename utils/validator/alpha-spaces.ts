import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsAlphaSpacesConstraint implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    return /^[a-zA-Z\s]+$/.test(text);
  }

  defaultMessage(args: ValidationArguments) {
    return '$property should contain only letters and spaces';
  }
}

export function IsAlphaSpaces(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsAlphaSpacesConstraint,
    });
  };
}