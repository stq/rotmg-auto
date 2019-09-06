import { LogProvider, LogLevel } from './logger';
import { WriteStream } from 'fs';
import { StringUtils } from './string-utils';

export class FileLogger implements LogProvider {

  constructor(private logStream: WriteStream) { }

  log(sender: string, message: string, level: LogLevel): void {
    const senderString = (`[${StringUtils.getTime()} | ${sender}]`);
    const printString: string = StringUtils.pad(senderString, 30) + message;
    let levelString = LogLevel[level];
    if (!levelString) {
      levelString = 'custom';
    }
    this.logStream.write(StringUtils.pad(levelString.toUpperCase(), 8) + printString + '\n');
  }
}
