import { Pipe, PipeTransform } from '@angular/core';
import {Utils} from 'app/shared/utils';

@Pipe({
  name: 'byteFormat'
})
export class ByteFormatPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return Utils.formatByte(value);
  }

}
