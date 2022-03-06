import axios, { AxiosInstance } from 'axios'
import { CreateTagOpts, Tag } from './models/tags'
import { MergeOptions, Reading, UpdatedReadings } from './models/readings'
import { ActionRequest, ActionResponse } from './models/actions'
import { Device, CreateDeviceInterface, DeviceInterface } from './models/devices'
import { Packet } from './models/packets'
import Agent from 'agentkeepalive'
import { ClientOptions, RequestOptions, Response } from './models/api'

export class ElementIoTClient {
    private client: AxiosInstance
    private rateLimitRemaining: number
    private rateLimitReset: number
    private log: (...data: any[]) => void
    private error: (...data: any[]) => void

    constructor(options: ClientOptions, httpClient?: AxiosInstance) {
        if (options.apiKey === undefined || options.apiKey === '') {
            throw new Error("Missing api key")
        }
        if (!httpClient && options.url !== undefined &&
            (!options.url.startsWith('https') && !options.url.startsWith('http'))) {
            throw new Error("serviceUrl must start with https")
        }

        this.log = options.log || console.log
        this.error = options.error || console.error
        this.rateLimitRemaining = options.rateLimit?.remaining || 50
        this.rateLimitReset = options.rateLimit?.reset || 5000
        const keepAliveAgent = new Agent({
            maxSockets: 100,
            maxFreeSockets: 10,
            timeout: 60000,
            freeSocketTimeout: 30000,
        });

        if (!httpClient) {
            this.client = axios.create({
                baseURL: `${options.url || "https://element-iot.com"}/`,
                httpAgent: keepAliveAgent
            })
        } else {
            this.client = httpClient
        }
        this.client.interceptors.request.use((config) => {
            config.params = config.params || {};
            config.params['auth'] = options.apiKey
            return config;
        });
        const that = this
        this.client.interceptors.response.use(async (response) => {
            const rateLimitRemaining = response.headers['x-ratelimit-remaining']
            const rateLimitReset = response.headers['x-ratelimit-reset']
            if (options.logRateLimits) {
                this.log(`Rate limit remaining ${rateLimitRemaining}`)
                this.log(`Rate limit reset ${rateLimitReset}`)
            }
            that.rateLimitRemaining = rateLimitRemaining || 5
            that.rateLimitReset = rateLimitReset || 5000
            return response;
        });
        this.client.interceptors.request.use(async (config) => {
            if (that.rateLimitRemaining <= 3) {
                options.logRateLimits && this.log(`Rate limit reset in ${that.rateLimitReset}`)
                await new Promise(resolve => setTimeout(resolve, that.rateLimitReset * 2))
            }
            return config;
        });
    }

    async getDevice(elementDeviceId: string): Promise<Response<Device>> {
        return (await this.client.get(`api/v1/devices/${elementDeviceId}`)).data
    }

    async findDeviceByDevEUI(deviceEUI: string): Promise<Response<Device[]>> {
        return (await this.client.get(`api/v1/devices/by-eui/${deviceEUI}`)).data
    }

    async getTag(tagId: string): Promise<Tag> {
        return (await this.client.get<Response<Tag>>(`api/v1/tags/${tagId}`)).data.body
    }

    async getTags(options?: RequestOptions): Promise<Tag[]> {
        if (options?.limit && options?.limit <= 100) {
            return (await this.client.get<Response<Tag[]>>(`api/v1/tags`, { params: this.createParams(options) })).data.body
        } else {
            return this.paginate<Tag>(`tags`, options)
        }
    }

    async getDevicesByTagId(tagId: string, options?: RequestOptions): Promise<Device[]> {
        if (options?.limit && options?.limit <= 100) {
            return (await this.client.get<Response<Device[]>>(`api/v1/tags/${tagId}/devices`, { params: this.createParams(options) })).data.body
        } else {
            return this.paginate<Device>(`tags/${tagId}/devices`, options)
        }
    }

    async getDevices(options?: RequestOptions): Promise<Device[]> {
        if (options?.limit && options?.limit <= 100) {
            return (await this.client.get<Response<Device[]>>(`api/v1/devices`, { params: this.createParams(options) })).data.body
        } else {
            return this.paginate<Device>(`devices`, options)
        }
    }

    async getReadingsByTagId(tagId: string, options?: RequestOptions): Promise<Reading[]> {
        if (options?.limit && options?.limit <= 100) {
            return (await this.client.get<Response<Reading[]>>(`api/v1/tags/${tagId}/readings`, { params: this.createParams(options) })).data.body
        } else {
            return this.paginate<Reading>(`tags/${tagId}/readings`, options)
        }
    }

    async getPacketsByTagId(tagId: string, options?: RequestOptions): Promise<Packet[]> {
        if (options?.limit && options?.limit <= 100) {
            return (await this.client.get<Response<Packet[]>>(`api/v1/tags/${tagId}/packets`, { params: this.createParams(options) })).data.body
        } else {
            return this.paginate<Packet>(`tags/${tagId}/packets`, options)
        }
    }

    async getPackets(deviceId: string, options?: RequestOptions): Promise<Packet[]> {
        if (options?.limit && options?.limit <= 100) {
            return (await this.client.get(`api/v1/devices/${deviceId}/packets?`, { params: this.createParams(options) })).data.body
        } else {
            return this.paginate<Packet>(`devices/${deviceId}/packets`, options)
        }
    }

    async getPacketsChunked(deviceId: string, onChunk: (chunk: Packet[]) => Promise<void>, options?: RequestOptions): Promise<void> {
        return this.paginateChunked<Packet[]>(`devices/${deviceId}/packets`, onChunk, options)
    }

    async getReadingsChunked(deviceId: string, onChunk: (chunk: Reading[]) => Promise<void>, options?: RequestOptions): Promise<void> {
        return this.paginateChunked<Reading[]>(`devices/${deviceId}/readings`, onChunk, options)
    }

    async getReadings(deviceId: string, options?: RequestOptions): Promise<Reading[]> {
        if (options?.limit && options?.limit <= 100) {
            return (await this.client.get(`api/v1/devices/${deviceId}/readings`, { params: this.createParams(options) })).data.body
        } else {
            return this.paginate<Reading>(`devices/${deviceId}/readings`, options)
        }
    }

    private createParams(options: RequestOptions): any {
        const params = {} as any
        if (options.limit) {
            params['limit'] = options.limit
        }

        if (options.retrieveAfterId) {
            params['retrieve_after'] = options.retrieveAfterId
        }

        if (options.sort) {
            params['sort'] = options.sort
        }

        if (options.sortDirection) {
            params['sort_direction'] = options.sortDirection
        }

        if (options.filter) {
            params['filter'] = options.filter
        }
        if (options.withProfile) {
            params['with_profile'] = options.withProfile
        }

        return params
    }

    private async paginate<T>(resource: string, options?: RequestOptions) {
        let retrieveAfterId: string | undefined | null = options?.retrieveAfterId || undefined
        let values: T[] = []
        do {
            const params = this.createParams({
                limit: 100,
                ...options,
                retrieveAfterId
            })
            const response = await this.client.get<Response<T>>(`api/v1/${resource}`, { params })
            values = values.concat(response.data.body)
            retrieveAfterId = response.data.retrieve_after_id
        } while (retrieveAfterId)
        return values

    }
    private async paginateChunked<T>(resource: string, onChunk: (chunk: T) => Promise<void>, options?: RequestOptions) {
        let retrieveAfterId: string | undefined | null = options?.retrieveAfterId || undefined
        do {
            const params = this.createParams({
                limit: 100,
                ...options,
                retrieveAfterId
            })
            const response = await this.client.get<Response<T>>(`api/v1/${resource}`, { params })
            if ((response.data.body as any).length > 0) {
                await onChunk(response.data.body)
            }

            retrieveAfterId = response.data.retrieve_after_id
        } while (retrieveAfterId !== undefined)
    }

    async createDevice(name: string, tagId: string): Promise<Response<Device>> {
        return (await this.client.post(`api/v1/devices`, {
            device: {
                name: name,
                tags: [{
                    id: tagId
                }]
            }
        })).data
    }

    async deleteDevice(deviceId: string): Promise<Response<unknown>> {
        return await this.client.delete(`api/v1/devices/${deviceId}`)
    }

    async addInterfaceToDevice(deviceId: string, deviceInterface: CreateDeviceInterface): Promise<DeviceInterface> {
        return (await this.client.post(`api/v1/devices/${deviceId}/interfaces`, {
            interface: deviceInterface
        })).data
    }

    async deleteInterface(deviceId: string, interfaceId: string): Promise<Response<unknown>> {
        return (await this.client.delete(`api/v1/devices/${deviceId}/interfaces/${interfaceId}`)).data
    }

    async listInterfaces(deviceId: string): Promise<Response<DeviceInterface[]>> {
        return (await this.client.get(`api/v1/devices/${deviceId}/interfaces`)).data
    }

    async createActionOnInterface(deviceId: string, interfaceId: string, request: ActionRequest): Promise<ActionResponse> {
        return (await this.client.post(`api/v1/devices/${deviceId}/interfaces/${interfaceId}/actions/send_down_frame`, request)).data
    }

    async createAction(deviceId: string, request: ActionRequest): Promise<ActionResponse> {
        return (await this.client.post(`api/v1/devices/${deviceId}/actions/send_down_frame`, request)).data
    }

    async sendDownFrameByDeviceEUI(deviceEUI: string, request: ActionRequest): Promise<ActionResponse> {
        return (await this.client.post(`api/v1/devices/by-eui/${deviceEUI}/actions/send_down_frame`, request)).data
    }


    async getAction(deviceId: string, actionId: string): Promise<ActionResponse> {
        return (await this.client.get(`api/v1/devices/${deviceId}/actions/${actionId}`)).data
    }

    async createTag(name: string, opts: CreateTagOpts | null = null): Promise<Response<Tag>> {
        return (await this.client.post(`api/v1/tags`, {
            tag: {
                name: name,
                ...opts
            }
        })).data
    }

    async createTagPath(name: string): Promise<Response<Tag>> {
        return (await this.client.post(`api/v1/tags/mkdir`, {
            name: name
        })).data
    }

    async deleteTag(tagId: string): Promise<Response<unknown>> {
        return (await this.client.delete(`api/v1/tags${tagId}`))
    }

    async updateReadings(data: MergeOptions): Promise<UpdatedReadings> {
        return (await this.client.patch<Response<UpdatedReadings>>(`api/v1/readings`, data)).data.body
    }
}

