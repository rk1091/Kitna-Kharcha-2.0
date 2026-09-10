import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema<any>) {}

  transform(value: any, metadata: ArgumentMetadata) {
    try {
      if (metadata.type === 'body') {
        const parsedValue = this.schema.parse(value);
        return parsedValue;
      }
      return value;
    } catch (error) {
      throw new BadRequestException('Validation failed', { cause: error });
    }
  }
}
