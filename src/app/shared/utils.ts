
export class Utils {
  static formatMeter(size: number): String {
    const units = ['m', 'km'];
    return Utils.format(units, size, 1000, 2);
  }

  static formatByte(len: number): String {
    const units = ['bytes', 'kb', 'mb', 'gb'];
    return Utils.format(units, len, 1024, 2);
  }

  private static format(units: Array<String>, num: number, unit: number, fixed: number): String {
    let i = 0;
    for (; i < units.length; ++i) {
      if (num < unit) {
        break;
      }
      num /= 1024;
    }
    return (num <= 0 ? '0' : num.toFixed(fixed).replace(/\.0+$/, '')) + units[i === units.length ? i - 1 : i];
  }

  static addHhMmSs(val: string) {
    return val && val.match(/^\d{4}(-\d\d){2}$/) ? val + ' 00:00:00' : '';
  }
}
