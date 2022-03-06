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

export type WSPacket<T = any> = {
    interface: Interface;
    driver?: null;
    device_id: string;
    interface_id: string;
    is_meta: boolean;
    meta: Meta | null;
    inserted_at: string;
    transceived_at: string;
    packet_type: "up" | "down" | string;
    id: string;
} & WSPacketPayload<T>

export type WSPacketPayload<T = any> = {
    payload_encoding: "json"
    payload: T
} | {
    payload_encoding: "binary"
    payload: string
}

export type Interface = {
    driver_instance_id: string;
    device_id: string;
    enabled: boolean;
    meta?: null;
    opts: Opts | unknown;
    id: string;
}
export type Opts = {
    app_session_key: string;
    check_fcnt: boolean;
    class_c: boolean;
    device_address: string;
    device_eui: string;
    device_key: string;
    device_type: string;
    gw_whitelist?: null;
    join_eui: string;
    net_id: number;
    network_session_key: string;
    region: string;
    rx2_dr?: null;
    rx_delay: number;
}
export type Meta = {
    ack: boolean;
    adr_ack_req: boolean;
    chan: number;
    codr: string;
    confirm: boolean;
    data_rate: number;
    datr: string;
    dev_nonce?: null;
    frame_count_up: number;
    frame_port: number;
    frequency: number;
    gateway_stats?: (GatewayStatsEntity)[] | null;
    lns_packet_uuid: string;
    lorawan_toa_ms: number;
    mac_commands?: (null)[] | null;
    modu: string;
    region: string;
    region_meta: RegionMeta;
    rfch: number;
    size: number;
    stat: number;
}
export type GatewayStatsEntity = {
    router_id: number;
    router_id_hex: string;
    rssi: number;
    snr: number;
    tmst: number;
}
export type RegionMeta = {
    bandwidth: number;
    bitrate: number;
    code: string;
    datarate: number;
    name: string;
    spreadingfactor: number;
}
