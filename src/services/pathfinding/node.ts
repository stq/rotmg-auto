import { HeapItem } from './heap-item';
import { Hashable } from './hashable';

export class Node implements HeapItem<Node>, Hashable {
    parent: Node = null;
    gCost = 0;
    hCost = 0;
    x = 0;
    y = 0;
    walkable = true;
  heapIndex = -1;
    get fCost(): number {
    return this.gCost + this.hCost;
  }

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  hash(): string {
    return this.x + '' + this.y;
  }

  compareTo(item: Node): number {
    if (this.fCost > item.fCost) {
      return -1;
    }
    if (this.fCost === item.fCost) {
      if (this.hCost > item.hCost) {
        return -1;
      }
      if (this.hCost < item.hCost) {
        return 1;
      }
      return 0;
    }
    return 1;
  }
}
