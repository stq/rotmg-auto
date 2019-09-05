import {Client, Library, PacketHook} from './../core';
import * as _ from 'lodash';
import {MapInfoPacket} from '../networking';
import {GameId} from "../models/game-ids";
import {UpdatePacket} from "../networking/packets/incoming/update-packet";
import {TextPacket} from './../networking/packets/incoming';
import {RealmHeroLeftMessage} from "../networking/packets/incoming/realm-hero-left-msg";
import {QuestObjectIdPacket} from "../networking/packets/incoming/quest-objectid-packet";

const accountSid = '---';
const authToken = '---';
const twilioclient = require('twilio')(accountSid, authToken);

var shuffleTimer = 30 * 1000;
var shuffleSchedule: any = {};
var realmStateMap: any = {};

function getRealmState(fp: any) {
  if (realmStateMap[fp] === undefined) {
    console.log('Realm ' + fp + ' is new');
    realmStateMap[fp] = {
      ufoDead: undefined,
      smsSent: false,
      watchers: {}
    };
  }
  return realmStateMap[fp];
}

function shouldStayInRealm(client: any, mapInfo: any) {
  var realmState = getRealmState(mapInfo.fp);

  if (realmState.ufoDead) return false;
  if (Object.keys(realmState.watchers).length > 1) return false;

  if (shuffleSchedule[client.alias] === undefined) {
    shuffleSchedule[client.alias] = Date.now();
  }

  if (Date.now() > shuffleSchedule[client.alias]) {
    shuffleSchedule[client.alias] = Date.now() + shuffleTimer;
    return true;
  }
}


function processCalbrikQuotes(client: any, textPacket: any) {
  console.log('\u0007');

  var fps = _.keys(realmStateMap);
  var fp = _.find(fps, (f:any) => {
    var watchers = realmStateMap[f].watchers;
    return watchers[client.alias];
  });
  if (fp == undefined) {
    console.error('Unable to find realm watcher but watcher just detected quote', realmStateMap, client.serverUid(), client.alias);
  }

  var realmState = getRealmState(fp);

  const text = textPacket.text.substr(0, 10);

  const message = 'CALBRIK ' + text + " " + client.serverUid() + ' ' + client.alias ;
  console.log(message);

  if (text.substr(0, 7) == 'My ship') {

    realmState.ufoDead = true;
    // delete getRealmState(fp).watchers[client.alias];
    // client.changeGameId(GameId.RandomRealm);

  } else {
    if( realmState.ufoDead ) {
      realmState.smsSent = false;
      realmState.ufoDead = false;
    };
  }

  if (!realmState.ufoDead && !realmState.smsSent) {

    realmState.smsSent = true;

    twilioclient.messages
      .create({
        body: message,
        from: '+---',
        to: '+---'
      })
      .then((message: any) => console.log(message.sid));
  }

  console.log('realmState changed', realmState);
}


@Library({
  name: 'Hello Plugin',
  author: 'tcrane',
  enabled: false
})
class HelloPlugin {


  @PacketHook()
  onMapInfo(client: Client, mapInfo: MapInfoPacket): void {

    console.log('MapInfo', mapInfo.name, mapInfo.fp);

    getRealmState(mapInfo.fp).watchers[client.alias] = true;


    if( getRealmState(mapInfo.fp).name === undefined ) {
      getRealmState(mapInfo.fp).name = client.serverUid();
    } else if( getRealmState(mapInfo.fp).name != client.serverUid() ) {
      console.warn('Seems like realm was reset ', getRealmState(mapInfo.fp).name, client.serverUid());
    }

    if (mapInfo.name == 'Nexus') {
      console.log('Changing location for ' + client.alias + ' because it is in Nexus');
      delete getRealmState(mapInfo.fp).watchers[client.alias];
      client.changeGameId(GameId.RandomRealm);
    } else if(mapInfo.name == 'Oryx\'s Castle'){
      console.log('Changing location for ' + client.alias + ' because it is Oryx Castle');
      delete getRealmState(mapInfo.fp).watchers[client.alias];
      client.changeGameId(GameId.RandomRealm);
    } else if (!shouldStayInRealm(client, mapInfo)) {
      console.log('Changing realm to another for ' + client.alias + ' at ' + client.serverUid());
      delete getRealmState(mapInfo.fp).watchers[client.alias];
      client.changeGameId(GameId.RandomRealm);
    }
  }


  @PacketHook()
  onText(client: Client, textPacket: TextPacket): void {
    // console.log('[' + client.serverUid() + '/' + client.alias + '] ' + textPacket.name + ': ' + textPacket.text);

    if (textPacket.name.indexOf('#Commander Calbrik') >= 0) {
      processCalbrikQuotes(client, textPacket);
    }
  }

}
