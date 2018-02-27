export class Utils {
    static formatMeterEn(size: number): string {
        const units = ['m', 'km'];
        return Utils.format(units, size, 1000, 2);
    }

    static formatMeterCn(size: number): string {
        const units = ['米', '千米'];
        return Utils.format(units, size, 1000, 2);
    }

    static formatByteEn(len: number): string {
        const units = ['bytes', 'kb', 'mb', 'gb'];
        return Utils.format(units, len, 1024, 2);
    }

    static formatTimeEn(seconds: number) {
        const units = ['s', 'm', 'h'];
        return Utils.format(units, seconds, 60, 0);
    }

    static formatTimeCn(seconds: number) {
        const units = ['秒', '分钟', '小时'];
        return Utils.format(units, seconds, 60, 0);
    }

    private static format(units: Array<String>, num: number, unit: number, fixed: number): string {
        let i = 0;
        for (; i < units.length; ++i) {
            if (num < unit) {
                break;
            }
            num /= unit;
        }
        return (num <= 0 ? '0' : num.toFixed(fixed).replace(/\.0+$/, '')) + units[i === units.length ? i - 1 : i];
    }

    static addHhMmSs(val: string) {
        return val && val.match(/^\d{4}(-\d\d){2}$/) ? val + ' 00:00:00' : '';
    }
}
