export enum FactionNames {
    Illuminati = "Illuminati",
    Daedalus = "Daedalus",
    TheCovenant = "The Covenant",
    ECorp = "ECorp",
    MegaCorp = "MegaCorp",
    BachmanAssociates = "Bachman & Associates",
    BladeIndustries = "Blade Industries",
    NWO = "NWO",
    ClarkeIncorporated = "Clarke Incorporated",
    OmniTekIncorporated = "OmniTek Incorporated",
    FourSigma = "Four Sigma",
    KuaiGongInternational = "KuaiGong International",
    FulcrumSecretTechnologies = "Fulcrum Secret Technologies",
    BitRunners = "BitRunners",
    TheBlackHand = "The Black Hand",
    NiteSec = "NiteSec",
    Aevum = "Aevum",
    Chongqing = "Chongqing",
    Ishima = "Ishima",
    NewTokyo = "New Tokyo",
    Sector12 = "Sector-12",
    Volhaven = "Volhaven",
    SpeakersForTheDead = "Speakers for the Dead",
    TheDarkArmy = "The Dark Army",
    TheSyndicate = "The Syndicate",
    Silhouette = "Silhouette",
    Tetrads = "Tetrads",
    SlumSnakes = "Slum Snakes",
    Netburners = "Netburners",
    TianDiHui = "Tian Di Hui",
    CyberSec = "CyberSec",
    Bladeburners = "Bladeburners",
    ChurchOfTheMachineGod = "Church of the Machine God",
    ShadowsOfAnarchy = "Shadows of Anarchy",
}

export enum FactionType {
    Criminal,
    Corporation,
    Hacking,
    City,
    Endgame,
    Special
}
export interface Faction {
    name: string;
    hostname: string;
    ticker: string;
    invited: boolean;
    augmentations: string[];
    rep: number;
    favor: number;
    blocked: boolean;
    member: boolean;
    enemies: string[];
    offers_field: boolean;
    offers_hacking: boolean;
    offers_security: boolean;
    keep_on_reset: boolean;
    city: string | null;
    aug_req: number;
    cash_req: number;
    hack_req: number;
    combat_req: number;
    karma_req: number;
    reputation_req: number;
    backdoor_req: string;
    hnet_req: {level: number, ram: number, core: number}
    type: FactionType
}


export const Factions: Map<string, Faction> = new Map();
