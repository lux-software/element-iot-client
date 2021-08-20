export interface Packet {
    id: string;
    payload: unknown;
    payload_encoding: string;
    packet_type: string;
    meta: unknown;
    transceived_at: Date;
    inserted_at: Date;
    is_meta: boolean;
}