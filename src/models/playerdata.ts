import { WorldPosData } from './../networking/data/world-pos-data';
import { Classes } from './classes';
import { GuildRank } from './guildrank';

export interface PlayerData {
    objectId: number;
    worldPos: WorldPosData;
    name: string;
    level: number;
    exp: number;
    currentFame: number;
    stars: number;
    accountId: string;
    accountFame: number;
    nameChosen: boolean;
    guildName: string;
    guildRank: GuildRank;
    gold: number;
    class: Classes;
    maxHP: number;
    maxHPBoost: number;
    maxMP: number;
    maxMPBoost: number;
    hp: number;
    mp: number;
    atk: number;
    atkBoost: number;
    def: number;
    defBoost: number;
    spd: number;
    spdBoost: number;
    dex: number;
    dexBoost: number;
    wis: number;
    wisBoost: number;
    vit: number;
    vitBoost: number;
    condition: number;
    hpPots: number;
    mpPots: number;
    hasBackpack: boolean;
    inventory: number[];
    server: string;
}

export function getDefaultPlayerData(): PlayerData {
  return {
    objectId: 0,
    worldPos: null,
    name: null,
    level: 0,
    exp: 0,
    currentFame: 0,
    stars: 0,
    accountId: null,
    accountFame: 0,
    gold: 0,
    class: Classes.Wizard,
    nameChosen: false,
    guildName: null,
    guildRank: GuildRank.NoRank,
    maxHP: 0,
    maxHPBoost: 0,
    maxMP: 0,
    maxMPBoost: 0,
    hp: 0,
    mp: 0,
    atk: 0,
    atkBoost: 0,
    def: 0,
    defBoost: 0,
    spd: 0,
    spdBoost: 0,
    dex: 0,
    dexBoost: 0,
    wis: 0,
    wisBoost: 0,
    vit: 0,
    vitBoost: 0,
    condition: 0,
    hpPots: 0,
    mpPots: 0,
    hasBackpack: false,
    inventory: new Array<number>(20).fill(-1),
    server: null
  };
}
