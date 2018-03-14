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
        const units = ['B', 'KB', 'MB', 'GB'];
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

    static isImage(name: string): boolean {
        return Utils.isMedia(name, ['jpg', 'png', 'jpeg']);
    }

    static isVideo(name: string): boolean {
        return Utils.isMedia(name, ['mp4']);
    }

    static isAudio(name: string): boolean {
        return Utils.isMedia(name, ['aac', 'mp3']);
    }

    private static isMedia(name: string, types: Array<string>): boolean {
        const lowercaseName = name.toLowerCase();
        for (const i in types) {
            if (lowercaseName.endsWith(types[i])) {
                return true;
            }
        }
        return false;
    }

    static urlParams(url: string, params: any) {
        let res = url + (url.indexOf('?') === -1 ? '?' : '');
        let first = true;
        for (const param in params) {
            if (params.hasOwnProperty(param)) {
                if (!first) {
                    res += '&';
                    first = false;
                }
                res += param + '=' + params[param];
            }
        }
        return res;
    }
}
