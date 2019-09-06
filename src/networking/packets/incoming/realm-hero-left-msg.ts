import { PacketBuffer } from '../../packet-buffer';
import { PacketType } from '../../packet-type';
import { IncomingPacket } from '../../packet';

export class RealmHeroLeftMessage implements IncomingPacket {

  type = PacketType.REALMHERO_LEFT_MSG;
  propagate = true;

  //#region packet-specific members
    realmHeroesLeft: number;
  //#endregion

  read(buffer: PacketBuffer): void {
    this.realmHeroesLeft = buffer.readInt32();
  }
}
