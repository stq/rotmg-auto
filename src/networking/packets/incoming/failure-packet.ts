import {PacketBuffer} from '../../packet-buffer';
import {PacketType} from '../../packet-type';
import {IncomingPacket} from '../../packet';
import {FailureCode} from '../../../models/failure-code';

export class FailurePacket implements IncomingPacket {

  type = PacketType.FAILURE;
  propagate = true;

  //#region packet-specific members
  errorId: FailureCode;
  errorDescription: string;

  //#endregion

  read(buffer: PacketBuffer): void {
    this.errorId = buffer.readInt32();
    this.errorDescription = buffer.readString();
  }
}
