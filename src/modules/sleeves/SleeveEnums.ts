export interface SleeveObject {
    id: number,
    hp: {
        current: number,
        max: number,
    },
    money: number,
    city: string,
    location: string,
    work: {
        isWorking: boolean,
        type: string,
        jobs: string[],
        titles: string[],
        time: number,
    },
    gym: {
        stat: string
    },
    software: {
        tor: boolean,
    },
    multipliers: {
        companyRep: number,
    },
    crime: {
        type: string,
        multipliers: {
            money: number,
            success: number,
        }
    },
    faction: {
        multipliers: {
            rep: number,
        }
    },
    agility: {
        level: number,
        multipliers: {
            exp: number,
            level: number
        },
    },
    charisma: {
        level: number,
        multipliers: {
            exp: number,
            level: number
        },
    },
    defense: {
        level: number,
        multipliers: {
            exp: number,
            level: number
        },
    },
    dexterity: {
        level: number,
        multipliers: {
            exp: number,
            level: number
        },
    },
    hacking: {
        level: number,
        multipliers: {
            exp: number,
            level: number
        },
    },
    strength: {
        level: number,
        multipliers: {
            exp: number,
            level: number
        },
    },
    shock: number,
    sync: number,
    augs: {
        owned: string[],
        buyable: { cost: number, name: string }[]
        buy: (augName: string) => boolean;        
    },
    actions: {
        bladeburner: (action: string, contract?: string) => boolean
        crime: (name: string) => boolean
        work: (name: string) => boolean
        faction: (name: string, type: string) => boolean | undefined
        gym: (name: string, stat: string) => boolean
        recover: () => boolean
        sync: () => boolean
        uni: (uni: string, cls: string) => boolean
        travel: (city: string) =>  boolean // maybe Promise<void>?
    }
}
