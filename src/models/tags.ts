
export interface CreateTagOpts {
    color_hue?: number;
}

export interface Tag {
    updated_at: Date;
    slug: string;
    profile_data: [];
    parent_id: string | null;
    name: string;
    mandate_id: string;
    inserted_at: Date;
    id: string;
    group_interface_id: string | null;
    fields: unknown;
    description: string | null;
    default_readings_view_id: string | null;
    default_packets_view_id: string | null;
    default_layers_id: string | null;
    default_graph_preset_id: string | null;
    default_devices_view_id: string | null;
    color_hue: number;
}