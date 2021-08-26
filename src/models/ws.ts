export interface WSReading<T = any> {
    parser_id: string,
    device_id: string,
    packet_id: string,
    location: unknown,
    inserted_at: string,
    measured_at: string,
    data: T,
    id: string
}