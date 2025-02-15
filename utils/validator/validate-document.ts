/* import { TipoDocumento } from '@prisma/client';
import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'validateDocument', async: false })
export class ValidateDocument implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    const tipoDoc = args.object['tipoDoc'] as TipoDocumento;

    switch (tipoDoc) {
      case TipoDocumento.DNI:
        return /^\d{8}$/.test(value);
      case TipoDocumento.RUC:
        return /^\d{11}$/.test(value);
      case TipoDocumento.CE:
        return /^[a-zA-Z0-9]{9,12}$/.test(value);
      case TipoDocumento.PASAPORTE:
        return /^[a-zA-Z0-9]{9}$/.test(value);
      default:
        return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    const tipoDoc = args.object['tipoDoc'] as TipoDocumento;

    switch (tipoDoc) {
      case TipoDocumento.DNI:
        return 'El DNI debe tener 8 dígitos numéricos';
      case TipoDocumento.RUC:
        return 'El RUC debe tener 11 dígitos numéricos';
      case TipoDocumento.CE:
        return 'El Carnet de Extranjería debe tener entre 9 y 12 caracteres alfanuméricos';
      case TipoDocumento.PASAPORTE:
        return 'El pasaporte debe tener 9 caracteres alfanuméricos';
      default:
        return 'Número de documento inválido';
    }
  }
} */