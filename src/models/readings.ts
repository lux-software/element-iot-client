export interface MergeOptions {
    filter: string;
    merge_expr: { [key: string]: string }
}

export interface Reading {
    id: string;
    device_id: string;
    transceived_at: Date;
    payload_encoding: string;
    payload: unknown;
    packet_type: string;
    meta: null | unknown;
    is_meta: boolean;
    interface_id: string;
    inserted_at: Date;
}

export interface UpdatedReadings {
    affected: number;
}