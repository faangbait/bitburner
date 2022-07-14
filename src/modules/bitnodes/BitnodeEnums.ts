/**
 * @public
 */
export interface BitnodeMultiplier {
    augmentations: {
        money: number,
        rep: number,
        daedalus_req: number,
    },
    agility: number,
    charisma: number,
    defense: number,
    dexterity: number,
    strength: number,
    bladeburner: {
        rank: number,
        skill: number
    },
    gym: number,
    leetcode: number,
    company: {
        exp: number,
        money: number
    },
    corporation: {
        softcap: number,
        valuation: number
    },
    crime: {
        exp: number,
        money: number
    },
    faction: {
        passive: number,
        rep: number,
        min_favor: number,
        work: {
            exp: number,
            rep: number
        }
    },
    tix: number,
    gang: number,
    hacking: {
        exp: number,
        level: number,
        manual: number,
        money: {
            gain: number,
            movement: number
        },
        growth: number,
        max_money: number,
        starting_money: number,
        starting_sec: number,
        weaken: number,
        daemon: number
    },
    hacknet: {
        production: number
    },
    purchased_servers: {
        cost: number,
        limit: number,
        ram: number,
        softcap: number,
        home_ram: number
    }
    infiltration: {
        money: number,
        rep: number
    },
    stanek: {
        power: number,
        size: number
    }
}

export interface Bitnode {
    number: number;
    completed: number;
    multipliers: BitnodeMultiplier
}

export const Bitnodes: Map<string, Bitnode> = new Map();
