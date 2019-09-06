import {PacketBuffer} from '../../packet-buffer';
import {PacketType} from '../../packet-type';
import {IncomingPacket} from '../../packet';

export class PasswordPromptPacket implements IncomingPacket {

  type = PacketType.PASSWORDPROMPT;
  propagate = true;

  //#region packet-specific members
  cleanPasswordStatus: number;

  //#endregion

  read(buffer: PacketBuffer): void {
    this.cleanPasswordStatus = buffer.readInt32();
  }
}
