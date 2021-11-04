import { Point } from "./devices";

export interface MergeOptions {
    filter: string;
    merge_expr: { [key: string]: string }
}

export interface Reading<T = any> {
    parser_id: string
    device_id: string
    packet_id: string
    location: Point | null
    inserted_at: Date
    measured_at: Date
    data: T,
    id: string
}

export interface UpdatedReadings {
    affected: number;
}