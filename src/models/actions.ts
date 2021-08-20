export interface ActionResponse {
    updated_at: Date;
    type: 'send_down_frame' | unknown;
    state: 'pending' | unknown;
    result: null | unknown;
    events: unknown[];
    order: null | unknown;
    opts: unknown;
    mandate_id: string;
    interface_id: string;
    inserted_at: Date;
    id: string;
    executed_at: null | Date;
    device_id: string;
}

export interface ActionRequest {
    opts: unknown
}