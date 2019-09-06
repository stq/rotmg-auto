import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { OutgoingPacket } from '../../packet';

export class CancelTradePacket implements OutgoingPacket {

  type = PacketType.CANCELTRADE;

  //#region packet-specific members
    objectId: number;
  //#endregion

  write(buffer: PacketBuffer): void {
    //
  }
}
