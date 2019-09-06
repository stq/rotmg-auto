import { AccountInfo } from './../models';
import { Logger, LogLevel } from './logger';
import * as fs from 'fs';
import * as path from 'path';
const dir = path.dirname(require.main.filename);
// tslint:disable-next-line:no-var-requires
const packageFile = require('../../package.json');

export class Storage {
    static get(...filePath: string[]): Promise<any> {
    return new Promise((resolve: (data: any) => void, reject: (err: Error) => void) => {
      this.readText(...filePath).then((data) => {
        resolve(JSON.parse(data));
      }).catch((error) => {
        reject(error);
      });
    });
  }

    static readText(...filePath: string[]): Promise<string> {
    return new Promise((resolve: (data: string) => void, reject: (err: Error) => void) => {
      const fileName = this.makePath(...filePath);
      fs.readFile(fileName, 'utf8', (error, data) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(data);
      });
    });
  }

    static writeText(data: string, ...filePath: string[]): Promise<void> {
    return new Promise((resolve: () => void, reject: (err: Error) => void) => {
      const fileName = this.makePath(...filePath);
      fs.writeFile(fileName, data, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

    static makePath(...filePath: string[]): string {
    return path.resolve(__dirname, path.join(dir, ...filePath));
  }

    static set(data: object, ...filePath: string[]): Promise<void> {
    return this.writeText(JSON.stringify(data), ...filePath);
  }

    static getAccountConfig(): AccountInfo {
    return require('./../../acc-config.json');
  }

    static createLog(): fs.WriteStream {
    const logStream = fs.createWriteStream(Storage.makePath('nrelay-log.log'));
    const watermark = [
      '@==---------==@',
      `@ date           :: ${(new Date()).toString()}`,
      `@ nrelay version :: v${packageFile.version}`,
      `@ node version   :: ${process.version}`,
      '@==---------==@'
    ].join('\n');
    logStream.write(`${watermark}\n`);
    return logStream;
  }
}
