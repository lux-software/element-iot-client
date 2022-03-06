import WebSocket from 'ws'
import { EventEmitter } from 'events'
import { ClientOptions } from './models/api'
import TypedEmitter from "typed-emitter"
import { WSPacket, WSReading } from './models/ws'


type MessageEvents = {
    open: () => void
    close: () => void
    error: (error: Error) => void
    packet: (packet: WSPacket) => void
    reading: (reading: WSReading) => void
}

export class ElementIoTClientWS extends (EventEmitter as new () => TypedEmitter<MessageEvents>) {

    private apiKey: string
    private url: string
    pingTimeout: NodeJS.Timeout | null = null
    ws: WebSocket
    type: string
    private log: (...data: any[]) => void
    private error: (...data: any[]) => void

    constructor(options: ClientOptions, type: 'readings' | 'packets', tagId?: string) {
        super()
        if (options.apiKey === undefined || options.apiKey === '') {
            throw new Error("Missing api key")
        }
        if (options.url !== undefined &&
            (!options.url.startsWith('wss') || !options.url.startsWith('ws'))) {
            throw new Error("Url must start with ws:// or wss://")
        }
        this.log = options.log || console.log
        this.error = options.error || console.error

        this.apiKey = options.apiKey
        this.url = options.url || "wss://element-iot.com"
        this.type = type


        if (tagId) {
            this.ws = new WebSocket(`${this.url}/api/v1/tags/${tagId}/${type}/socket?auth=${this.apiKey}`);
        } else {
            this.ws = new WebSocket(`${this.url}/api/v1/${type}/socket?auth=${this.apiKey}`)
        }
        this.ws.on('open', this.open.bind(this));
        this.ws.on('ping', this.heartbeat.bind(this));
        this.ws.on('close', this.close.bind(this));
        this.ws.on('error', this.onError.bind(this))
        this.ws.on('message', this.onMessage.bind(this))
    }

    private onError(error: Error) {
        this.emit('error', error)
    }
    private onMessage(message: WebSocket.Data) {
        try {
            const messageString = message.toString('utf-8')
            if (message !== 'pong') {

                const data = JSON.parse(messageString)[0]
                if (data.event === 'reading_added') {
                    this.emit('reading', { ...data.body })
                } else if (data.event === 'packet_added') {
                    this.emit('packet', { ...data.body })
                }
            }
        } catch (error) {
            this.error(error);
        }
    }

    private open() {
        this.log("ELEMENT IoT Client Connection open")
        this.emit("open")
        this.heartbeat()
    }
    private close() {
        this.log!("ELEMENT Kit Connection closed")
        this.clearPing()
        this.emit("close")

    }

    private heartbeat() {
        this.log("ELEMENT IoT Client sending heartbeat")
        const that = this
        this.pingTimeout = setTimeout(function () {
            that.heartbeat()
        }.bind(this), 30000 + 1000)
        this.ws.ping()
    }

    clearPing() {
        if (this.pingTimeout) {
            clearTimeout(this.pingTimeout)
        }
    }
    disconnect() {
        this.ws.close()
    }
}