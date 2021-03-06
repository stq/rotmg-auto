import * as fs from 'fs';
import * as path from 'path';
import {exec} from 'child_process';

import * as https from 'https';
import {createWriteStream, PathLike} from 'fs';
import {Logger, LogLevel} from './../services';
import {ASSET_ENDPOINT, CLIENT_VERSION_ENDPOINT, CLIENT_DL_ENDPOINT} from '../models';
import {HttpClient} from './http';
import {PacketIdMap, PacketType, Mapper} from '../networking';

const PACKET_REGEX = /static const ([A-Z_]+):int = (\d+);/g;
const dir = path.dirname(require.main.filename);
const GSC_PATH = path.join(
  'scripts', 'kabam', 'rotmg', 'messaging',
  'impl', 'GameServerConnection.as'
);
const DEFAULT_SWF_PATH = path.join(dir, 'src', 'services', 'updater-assets');
const DEFAULT_VERSION_PATH = path.join(dir, 'versions.json');

export interface VersionInfo {
  clientVersion: string;
  assetVersion: string;
}

export class Updater {

  static isClientOutdated(localVersion: string): Promise<boolean> {
    return this.getRemoteClientVersion().then((version) => {
      return localVersion !== version;
    });
  }

  static areAssetsOutdated(localVersion: string): Promise<boolean> {
    return this.getRemoteAssetVersion().then((version) => {
      return localVersion !== version;
    });
  }

  static getCurrentVersion(versionPath: string = DEFAULT_VERSION_PATH): VersionInfo {
    try {
      return require(versionPath);
    } catch (error) {
      if (error.code === 'MODULE_NOT_FOUND') {
        const newVersionInfo: VersionInfo = {
          assetVersion: '0',
          clientVersion: '0'
        };
        fs.writeFileSync(versionPath, JSON.stringify(newVersionInfo));
        return newVersionInfo;
      } else {
        throw error;
      }
    }
  }

  static updateLocalAssetVersion(version: string, versionPath: string): void {
    const current = this.getCurrentVersion(versionPath);
    current.assetVersion = version;
    fs.writeFileSync(versionPath, JSON.stringify(current));
  }

  static updateLocalClientVersion(version: string, versionPath: string): void {
    const current = this.getCurrentVersion(versionPath);
    current.clientVersion = version;
    fs.writeFileSync(versionPath, JSON.stringify(current));
  }

  static getClient(version: string): Promise<any> {
    const downloadPath = CLIENT_DL_ENDPOINT.replace('{{version}}', version);
    const clientPath = path.join(dir, 'src', 'services', 'updater-assets', 'client.swf');
    this.emptyFile(clientPath);
    const clientStream = createWriteStream(clientPath);
    return new Promise((resolve, reject) => {
      Logger.log('Updater', 'Downloading latest client.swf', LogLevel.Info);
      https.get(downloadPath, (res) => {
        res.on('data', (chunk) => {
          clientStream.write(chunk);
        });
        res.once('end', () => {
          Logger.log('Updater', 'Downloaded client.swf', LogLevel.Success);
          clientStream.end();
          res.removeAllListeners('data');
          res.removeAllListeners('error');
          resolve();
        });
        res.once('error', (error) => {
          clientStream.end();
          res.removeAllListeners('data');
          res.removeAllListeners('end');
          reject(error);
        });
      });
    });
  }

  static getGroundTypes(): Promise<any> {
    if (!fs.existsSync(path.join(dir, 'resources'))) {
      fs.mkdirSync(path.join(dir, 'resources'));
    }
    const groundTypesPath = path.join(dir, 'resources', 'GroundTypes.json');
    this.emptyFile(groundTypesPath);
    const groundTypesStream = createWriteStream(groundTypesPath);
    return new Promise((resolve, reject) => {
      Logger.log('Updater', 'Downloading latest GroundTypes.json', LogLevel.Info);
      https.get(ASSET_ENDPOINT + '/current/json/GroundTypes.json', (res) => {
        res.on('data', (chunk) => {
          groundTypesStream.write(chunk);
        });
        res.once('end', () => {
          Logger.log('Updater', 'Downloaded GroundTypes.json', LogLevel.Success);
          groundTypesStream.end();
          res.removeAllListeners('data');
          res.removeAllListeners('error');
          resolve();
        });
        res.once('error', (error) => {
          groundTypesStream.end();
          res.removeAllListeners('data');
          res.removeAllListeners('end');
          reject(error);
        });
      });
    });
  }

  static getObjects(): Promise<any> {
    const objectsPath = path.join(dir, 'resources', 'Objects.json');
    this.emptyFile(objectsPath);
    const objectsStream = createWriteStream(objectsPath);
    return new Promise((resolve, reject) => {
      Logger.log('Updater', 'Downloading latest Objects.json', LogLevel.Info);
      https.get(ASSET_ENDPOINT + '/current/json/Objects.json', (res) => {
        res.on('data', (chunk) => {
          objectsStream.write(chunk);
        });
        res.once('end', () => {
          Logger.log('Updater', 'Downloaded Objects.json', LogLevel.Success);
          objectsStream.end();
          res.removeAllListeners('data');
          res.removeAllListeners('error');
          resolve();
        });
        res.once('error', (error) => {
          objectsStream.end();
          res.removeAllListeners('data');
          res.removeAllListeners('end');
          reject(error);
        });
      });
    });
  }

  static getRemoteClientVersion(): Promise<string> {
    return HttpClient.get(CLIENT_VERSION_ENDPOINT).then((result) => {
      return result.replace(/[^0-9]/g, '');
    });
  }

  static getRemoteAssetVersion(): Promise<string> {
    return HttpClient.get(ASSET_ENDPOINT + '/current/version.txt').then((result) => {
      return result.replace(/[^0-9]/g, '');
    });
  }

  static getRemoteVersions(): Promise<VersionInfo> {
    return Promise.all([
      this.getRemoteClientVersion(),
      this.getRemoteAssetVersion()
    ]).then((versions) => {
      return {
        clientVersion: versions[0],
        assetVersion: versions[1]
      };
    });
  }

  static getLatestAssets(): Promise<any> {
    return Promise.all([
      this.getGroundTypes(),
      this.getObjects()
    ]).then(() => {
      return this.getRemoteAssetVersion();
    }).then((version) => {
      return this.updateLocalAssetVersion(version, DEFAULT_VERSION_PATH);
    });
  }

  static getLatestClient(): Promise<any> {
    let clientVersion: string;
    return this.getRemoteClientVersion().then((version) => {
      clientVersion = version;
      return this.getClient(clientVersion);
    }).then(() => {
      return this.updateFrom(DEFAULT_SWF_PATH);
    }).then(() => {
      return this.updateLocalClientVersion(clientVersion, DEFAULT_VERSION_PATH);
    });
  }

  static getLatest(): Promise<any> {
    return Promise.all([
      this.getLatestClient(),
      this.getLatestAssets()
    ]).then(() => {
      Logger.log('Updater', 'Finished!', LogLevel.Success);
    }).catch((error) => {
      Logger.log('Updater', `Error: ${error.message}`, LogLevel.Error);
    });
  }

  static updateFrom(parentDir: string): Promise<any> {
    const realPath = parentDir.split(/\/|\\/g).join(path.sep);
    let swfDir = realPath;
    let swfName = 'client.swf';
    const stat = fs.statSync(realPath);
    if (stat.isFile()) {
      const parts = realPath.split(path.sep);
      swfName = parts.pop();
      swfDir = parts.join(path.sep);
    }
    return this.unpackSwf(swfDir, swfName).then(() => {
      Logger.log('Updater', 'Updating assets.', LogLevel.Info);
      const packets = this.extractPacketInfo(path.join(swfDir, 'decompiled', GSC_PATH));
      this.updatePackets(packets);
    });
  }

  private static emptyFile(filePath: PathLike): void {
    try {
      fs.truncateSync(filePath, 0);
    } catch (error) {
      if (error.code === 'ENOENT') {
        fs.writeFileSync(filePath, '', {encoding: 'utf8'});
      } else {
        throw error;
      }
    }
  }

  private static unpackSwf(parentDir: string, swfName: string): Promise<any> {
    return new Promise((resolve: () => void, reject: (err: Error) => void) => {
      Logger.log('Updater', `Unpacking ${swfName}`, LogLevel.Info);
      const args = [
        '-jar',
        (`"${path.join(dir, 'lib', 'jpexs', 'ffdec.jar')}"`),
        '-selectclass kabam.rotmg.messaging.impl.GameServerConnection,com.company.assembleegameclient.parameters.Parameters',
        '-export script',
        (`"${path.join(parentDir, 'decompiled')}"`),
        (`"${path.join(parentDir, swfName)}"`)
      ];
      exec(`java ${args.join(' ')}`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        Logger.log('Updater', `Unpacked ${swfName}`, LogLevel.Success);

        resolve();
      });
    });
  }

  private static extractPacketInfo(assetPath: string): PacketIdMap {
    let raw = null;
    raw = fs.readFileSync(assetPath, {encoding: 'utf8'});
    const packets: PacketIdMap = {};
    let match = PACKET_REGEX.exec(raw);
    while (match != null) {
      packets[+match[2]] = match[1].replace('_', '') as PacketType;
      match = PACKET_REGEX.exec(raw);
    }
    Logger.log('Updater', 'Extracted packet info.', LogLevel.Success);
    return packets;
  }

  private static updatePackets(newPackets: PacketIdMap): void {
    const filePath = path.join(dir, 'packets.json');
    fs.writeFileSync(filePath, JSON.stringify(newPackets), {encoding: 'utf8'});
    Mapper.mapIds(newPackets);
    Logger.log('Updater', 'Updated packets.json', LogLevel.Success);
  }
}
