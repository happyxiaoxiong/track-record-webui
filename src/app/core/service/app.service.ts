import {Injectable} from '@angular/core';

const SERVER_ROOT_PATH = '/api/v1/';

function urlJoin(...params: string[]) {
    return SERVER_ROOT_PATH + params.join('/');
}

const noAuth = 'no_auth';
const track = 'track';

export const server = {
    rootPath: SERVER_ROOT_PATH,
    successCode: 0,
    apis: {
        noAuth: {
            login: urlJoin(noAuth, 'login'),
            register: urlJoin(noAuth, 'register'),
            exist: urlJoin(noAuth, 'exist')
        },
        config: urlJoin('config'),
        track: {
            upload: urlJoin(track, 'file/upload'),
            uploadState: urlJoin(track, 'file/upload/state'),
            search: urlJoin(track, 'search'),
            route: urlJoin(track, 'route/:id')
        },
        extra: {
            qqConvertor: urlJoin('extra', 'qq_convertor')
        }
    }
};

@Injectable()
export class AppService {
    private config: any = null;

    constructor() {
    }

    setConfig(config: any) {
        this.config = config;
    }

    getTokenConfig(): any {
        return this.config ? this.config.token : {};
    }
}
