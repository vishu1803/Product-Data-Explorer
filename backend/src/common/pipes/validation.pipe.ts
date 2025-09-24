import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

type MetaType = new (...args: unknown[]) => unknown;

@Injectable()
export class ValidationPipe implements PipeTransform<unknown> {
  async transform(value: unknown, { metatype }: ArgumentMetadata): Promise<unknown> {
    // If no metatype or it's a primitive type, return as-is
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // Transform plain object to class instance
    const object = plainToClass(metatype as MetaType, value as object);
    
    // Validate the transformed object (ensure it's an object)
    if (typeof object !== 'object' || object === null) {
      throw new BadRequestException('Invalid input: expected an object');
    }
    
    const errors = await validate(object as object);
    
    if (errors.length > 0) {
      const errorMessages = errors.map(error => {
        return Object.values(error.constraints || {}).join(', ');
      }).join('; ');
      
      throw new BadRequestException(`Validation failed: ${errorMessages}`);
    }
    
    // Return the validated and transformed object
    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
