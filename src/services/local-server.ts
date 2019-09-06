import { createServer, Server, Socket } from 'net';
import { Logger, LogLevel } from './logger';
import { SocketWrapper, environment } from '../models';
import { EventEmitter } from 'events';

const DEFAULT_PORT = 5680;
export class LocalServer {

    static init(port?: number): void {
    if (!port) {
      port = DEFAULT_PORT;
    }
    if (this.initialized) {
      Logger.log('Local Server', 'Local Server has already been initialized.', LogLevel.Warning);
      return;
    }
    this.initialized = true;
    this.sockets = [];
    this.emitter = new EventEmitter();
    Logger.log('Local Server', 'Initializing local server.', LogLevel.Info);
    this.server = createServer(this.onConnection.bind(this));
    this.server.on('error', (err) => {
      Logger.log('Local Server', err.message, LogLevel.Error);
    });
    this.server.on('close', () => {
      Logger.log('Local Server', 'Local Server closed.', LogLevel.Warning);
    });
    this.server.on('listening', () => {
      Logger.log('Local Server', `Local Server is now listening on port ${port}!`, LogLevel.Success);
    });
    this.server.listen(port);
  }

    static write(message: string | Buffer): void {
    if (!this.sockets) {
      return;
    }
    let buffer: Buffer;
    if (!Buffer.isBuffer(message)) {
      buffer = Buffer.from(message, 'utf8');
    } else {
      buffer = message;
    }
    buffer = Buffer.concat([Buffer.alloc(4), buffer], buffer.length + 4);
    buffer.writeInt32LE(buffer.length - 4, 0);
    for (const wrapper of this.sockets) {
      if (wrapper.socket.writable) {
        wrapper.socket.write(buffer);
      }
    }
    buffer = null;
  }

    static on(event: 'message', listener: (message: string) => void): EventEmitter {
    if (!this.emitter) {
      this.emitter = new EventEmitter();
    }
    return this.emitter.on(event, listener);
  }
  private static emitter: EventEmitter;

  private static socketIdCounter = 0;
  private static sockets: SocketWrapper[];
  private static server: Server;
  private static initialized = false;
  private static onConnection(socket: Socket): void {
    const wrapper = new SocketWrapper(this.getNextSocketId(), socket);
    this.sockets.push(wrapper);
    Logger.log('Local Server', 'Socket connected!', LogLevel.Success);
    wrapper.socket.on('close', (hadError) => {
      Logger.log('Local Server', 'Socket disconnected.', LogLevel.Warning);
      this.sockets.splice(this.sockets.findIndex((s) => s.id === wrapper.id), 1);
      wrapper.destroy();
    });
    wrapper.socket.on('data', (data) => {
      this.emitter.emit('message', (data.toString('utf8')));
    });
    wrapper.socket.on('error', (error) => {
      Logger.log('Local Server', `Received socket error: ${error.message}`, LogLevel.Debug);
    });
  }

  private static getNextSocketId(): number {
    return this.socketIdCounter++;
  }
}
