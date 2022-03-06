import { Tag } from "./tags";

export interface Device {
    id: string
    mandate_id: string
    name: string
    slug: string
    parser_id: string | null
    location?: Point
    tags: Tag[]
    interfaces: DeviceInterface[]
    profile_data: {
        updated_at: Date
        inserted_at: Date
        mandate_id: string
        fields: {
            display: string
            name: string
            required: boolean
            type: string
        }[],
        limit_to: string
        slug: string
        name: string
        id: string
    }[]
}

export interface Point {
    type: 'Point';
    coordinates: number[];
}

export interface CreateDeviceInterface {
    name: string;
    driver_instance_id: string;
    opts: unknown;
    enabled: boolean;
}
export interface DeviceInterface {
    id: string;
    name: string;
    driver_instance_id: string;
    opts: unknown;
    enabled: boolean;
}