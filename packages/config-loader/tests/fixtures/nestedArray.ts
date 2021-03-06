// Libraries
import { Type } from 'class-transformer';
import {
  IsString,
  IsDefined,
  IsNotEmptyObject,
  IsObject,
  ValidateNested,
  IsArray,
  ArrayMinSize,
} from 'class-validator';

// Dependencies
import { Loader } from '../../src';

class Bar {
  @IsString()
  foobar: string;
}

class Foo {
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => Bar)
  bar: Bar;

  @IsString()
  baz: string;
}

export class NestedArrayLoader extends Loader<'nestedArray'> {
  public readonly __name: 'nestedArray' = 'nestedArray';

  @IsDefined()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => Foo)
  foo: Foo[];
}
