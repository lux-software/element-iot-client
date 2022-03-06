
export interface RequestOptions {
    limit?: number;
    sort?: 'inserted_at' | 'transceived_at';
    sortDirection?: 'asc' | 'desc';
    retrieveAfterId?: null | string;
    filter?: string;
    withProfile?: boolean
}

export interface Response<T> {
    status: number;
    ok: boolean;
    retrieve_after_id: null | string;
    body: T;
}

export interface ClientOptions {
    rateLimit?: RateLimit;
    logRateLimits?: boolean
    apiKey: string;
    url?: string;
    log?: (...data: any[]) => void
    error?: (...data: any[]) => void
}

export interface RateLimit {
    remaining: number;
    reset: number;
}
