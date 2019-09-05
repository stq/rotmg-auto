import { ClaimDailyRewardMessage } from '../networking/packets/outgoing/claim-daily-reward-message';
import { GoToQuestRoomPacket } from '../networking/packets/outgoing/go-to-quest-room-packet';
import { HttpClient } from '../services/http';
import {Library} from "../decorators/library";
import {LogLevel} from "../services/logger";
import {Logger} from "../services/logger";
import {Client} from "../core";

const KEY_REGEX = /<key>(\w+)<\/key>/g;

@Library({
  name: 'Collector',
  author: 'tcrane+kiwi5',
  enabled: true
})
class CollectorPlugin {
  constructor() {
    Client.on('ready', (client: Client) => {
      if (client.mapInfo.name === 'Nexus') {
        Logger.log('Collector', `Sending ${client.alias} to quest room`);
        const gotoQuestRoom = new GoToQuestRoomPacket();
        client.packetio.sendPacket(gotoQuestRoom);
      } else {
        Logger.log('Collector', `Fetching calendar for ${client.alias}`);
        HttpClient.get('https://realmofthemadgodhrd.appspot.com/dailyLogin/fetchCalendar', { query: {
          guid: client.guid,
          password: client.password
        }})
          .then((response:any) => {
          Logger.log('Collector', `Received calendar for ${client.alias}`, LogLevel.Success);
          const items = this.getKeys(response);
          if (items.length === 0) {
            Logger.log('Collector', `Nothing to collect for ${client.alias}!`, LogLevel.Success);
            client.destroy();
          } else {
            Logger.log('Collector', `Collecting ${items.length} item${items.length === 1 ? '' : 's'} for ${client.alias}`);
            this.collect(items, client)
              .then(() => {
                Logger.log('Collector', `Finished collecting items for ${client.alias}!`, LogLevel.Success);
                client.destroy();
              });
          }
        }).catch((error:any) => {
          Logger.log('Collector', `Error fetching calendar for ${client.alias}`);
          Logger.log('Collector', error.message, LogLevel.Warning);
        });
      }
    });
  }

  private getKeys(xml: string): string[] {
    const items: string[] = [];
    let match = KEY_REGEX.exec(xml);
    while (match !== null) {
      items.push(match[1]);
      match = KEY_REGEX.exec(xml);
    }
    return items;
  }

  private collect(collectables: string[], client: Client): Promise<void> {
    return new Promise((resolve, reject) => {
      const collect = (item: string) => {
        Logger.log('Collector', `Collecting item(s) for ${client.alias}`, LogLevel.Info);
        const claim = new ClaimDailyRewardMessage();
        claim.claimKey = item;
        claim.claimType = 'nonconsecutive';
        client.packetio.sendPacket(claim);
        if (collectables.length > 0) {
          setTimeout(() => {
            collect(collectables.shift());
          }, 1500);
        } else {
          resolve();
        }
      };
      collect(collectables.shift());
    });
  }
}
