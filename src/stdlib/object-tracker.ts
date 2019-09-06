import { Library, PacketHook, Client } from '../core';
import { EventEmitter } from 'events';
import { ObjectData, UpdatePacket, NewTickPacket } from '../networking';

export type ObjectEventListener = (obj: ObjectData, client: Client) => void;

@Library({
  name: 'Object Tracker',
  author: 'tcrane',
  description: 'A utility library for keeping track of objects.'
})
export class ObjectTracker {
  private emitter: EventEmitter;
  private readonly trackedTypes: {
    [type: number]: boolean;
  };
  private readonly trackedObjects: {
    [guid: string]: ObjectData[];
  };

  constructor() {
    this.emitter = new EventEmitter();
    this.trackedTypes = {};
    this.trackedObjects = {};
  }

    on(event: number | 'any', listener: ObjectEventListener): this {
    this.emitter.on(event.toString(), listener);
    return this;
  }

    startTracking(objectType: number, listener?: ObjectEventListener): this {
    this.trackedTypes[objectType] = true;
    if (listener) {
      this.on(objectType, listener);
    }
    return this;
  }

    stopTracking(objectType: number): this {
    if (!this.trackedTypes.hasOwnProperty(objectType)) {
      return;
    }
    delete this.trackedTypes[objectType];
    this.emitter.removeAllListeners(objectType.toString());
  }

  @PacketHook()
  private onUpdate(client: Client, update: UpdatePacket): void {
    for (const obj of update.newObjects) {
      if (this.trackedTypes[obj.objectType]) {
        if (!this.trackedObjects.hasOwnProperty(client.guid)) {
          this.trackedObjects[client.guid] = [];
        }
        this.trackedObjects[client.guid].push(obj);
        this.emitter.emit(obj.objectType.toString(), obj, client);
        this.emitter.emit('any', obj, client);
      }
    }

    if (!this.trackedObjects.hasOwnProperty(client.guid)) {
      return;
    }
    for (const drop of update.drops) {
      for (let n = 0; n < this.trackedObjects[client.guid].length; n++) {
        if (this.trackedObjects[client.guid][n].status.objectId === drop) {
          this.trackedObjects[client.guid].splice(n, 1);
          break;
        }
      }
    }
  }

  @PacketHook()
  private onNewTick(client: Client, newTick: NewTickPacket): void {
    if (!this.trackedObjects.hasOwnProperty(client.guid) || this.trackedObjects[client.guid].length < 1) {
      return;
    }
    for (const status of newTick.statuses) {
      for (const obj of this.trackedObjects[client.guid]) {
        if (obj.status.objectId === status.objectId) {
          obj.status = status;
          break;
        }
      }
    }
  }
}
