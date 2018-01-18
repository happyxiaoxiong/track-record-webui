import { Pipe, PipeTransform } from '@angular/core';
import {Utils} from "app/shared/utils";

@Pipe({
  name: 'meterFormat'
})
export class MeterFormatPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return Utils.formatMeter(value);
  }

}
