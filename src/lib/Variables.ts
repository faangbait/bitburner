// Set a fixed amount of RAM to reserve on home for non-Phoenix scripts.
export const RESERVED_HOME_RAM = 16;

export enum PORTS {
    control = 1,
    servers,
    heartbeat,
    swap
}

export enum CONTROL_SEQUENCES {
    SIGHUP = 1,
    PAUSE,
    LIQUIDATE_CAPITAL
}

export enum SYS_FILES {
    KEEPALIVE = "/sys/keepalive.js",
    LAUNCHER = "/sys/launcher.js",
    PHOENIX = "/sys/phoenix.js",
    TUCSON = "/sys/tucson.js",
    HACKNET = "/sys/hacknet.js",
    PURCHASE_SVR = "/sys/manage_servers.js",
    MARKET = "/sys/stockmaster.js",
    MONITOR = "/sys/monitor.js",
}


export enum BIN_FILES {
    RESERVED_SHARE = "/bin/reserved_share.js",
    SHARE = "/bin/share.js",
    FUTURE_HACK = "/bin/hk.future.js",
    FUTURE_GROW = "/bin/gr.future.js",
    FUTURE_WEAK = "/bin/wk.future.js",
    BASIC_HACK = "/bin/hk.js",
    BASIC_GROW = "/bin/gr.js",
    BASIC_WEAK = "/bin/wk.js",
    BASIC_SERIAL = "/bin/hkgrwk.js",
    SWAP_RAM = "/bin/swap_ram.js"
}

export enum SINGULARITY_FILES {
    CONNECT_SERVER = "/singularity/connect_to_server.js",
    MANAGE_SOFTWARE = "/singularity/manage_software.js",
    DESTROY_DAEMON = "/singularity/destroy_world_daemon.js",
    TRAVEL = "/singularity/travel.js",
    JOIN_FACTION = "/singularity/join_faction.js",
    INSTALL_AUGS = "/singularity/install_augmentations.ts"
}

export enum FACTIONS {
    "Sector12" = "Sector-12",
    "Aevum" = "Aevum",
    "Chongqing" = "Chongqing",
    "NewTokyo" = "New Tokyo",
    "Ishima" = "Ishima",
    "Volhaven" = "Volhaven",
    "TianDiHui" = "Tian Di Hui",
    "Netburners" = "Netburners",
    "CyberSec" = "CyberSec",
    "NiteSec" = "NiteSec",
    "TheBlackHand" = "The Black Hand",
    "BitRunners" = "BitRunners",
    "ECorp" = "ECorp",
    "MegaCorp" = "MegaCorp",
    "KuaiGongInternational" = "KuaiGong International",
    "FourSigma" = "Four Sigma",
    "NWO" = "NWO",
    "BladeIndustries" = "Blade Industries",
    "OmniTekIncorporated" = "OmniTek Incorporated",
    "BachmanAsociates" = "Bachman & Asociates",
    "ClarkeIncorporated" = "Clarke Incorporated",
    "FulcrumSecretTechnologies" = "Fulcrum Secret Technologies",
    "SlumSnakes" = "Slum Snakes",
    "Tetrads" = "Tetrads",
    "Silhouette" = "Silhouette",
    "SpeakersfortheDead" = "Speakers for the Dead",
    "TheDarkArmy" = "The Dark Army",
    "TheSyndicate" = "The Syndicate",
    "TheCovenant" = "The Covenant",
    "Daedalus" = "Daedalus",
    "Illuminati" = "Illuminati"
}

export const FACTION_MODEL = [
    { id: FACTIONS.Sector12, blocks: [FACTIONS.Chongqing, FACTIONS.NewTokyo, FACTIONS.Ishima, FACTIONS.Volhaven] },
    { id: FACTIONS.Aevum, blocks: [FACTIONS.Chongqing, FACTIONS.NewTokyo, FACTIONS.Ishima, FACTIONS.Volhaven] },
    { id: FACTIONS.Chongqing, blocks: [FACTIONS.Sector12, FACTIONS.Aevum, FACTIONS.Volhaven] },
    { id: FACTIONS.NewTokyo, blocks: [FACTIONS.Sector12, FACTIONS.Aevum, FACTIONS.Volhaven] },
    { id: FACTIONS.Ishima, blocks: [FACTIONS.Sector12, FACTIONS.Aevum, FACTIONS.Volhaven] },
    { id: FACTIONS.Volhaven, blocks: [FACTIONS.Sector12, FACTIONS.Aevum, FACTIONS.Chongqing, FACTIONS.NewTokyo, FACTIONS.Ishima] },
    { id: FACTIONS.TianDiHui, blocks: [] },
    { id: FACTIONS.Netburners, blocks: [] },
    { id: FACTIONS.CyberSec, blocks: [] },
    { id: FACTIONS.NiteSec, blocks: [] },
    { id: FACTIONS.TheBlackHand, blocks: [] },
    { id: FACTIONS.BitRunners, blocks: [] },
    { id: FACTIONS.ECorp, blocks: [] },
    { id: FACTIONS.MegaCorp, blocks: [] },
    { id: FACTIONS.KuaiGongInternational, blocks: [] },
    { id: FACTIONS.FourSigma, blocks: [] },
    { id: FACTIONS.NWO, blocks: [] },
    { id: FACTIONS.BladeIndustries, blocks: [] },
    { id: FACTIONS.OmniTekIncorporated, blocks: [] },
    { id: FACTIONS.BachmanAsociates, blocks: [] },
    { id: FACTIONS.ClarkeIncorporated, blocks: [] },
    { id: FACTIONS.FulcrumSecretTechnologies, blocks: [] },
    { id: FACTIONS.SlumSnakes, blocks: [] },
    { id: FACTIONS.Tetrads, blocks: [] },
    { id: FACTIONS.Silhouette, blocks: [] },
    { id: FACTIONS.SpeakersfortheDead, blocks: [] },
    { id: FACTIONS.TheDarkArmy, blocks: [] },
    { id: FACTIONS.TheSyndicate, blocks: [] },
    { id: FACTIONS.TheCovenant, blocks: [] },
    { id: FACTIONS.Daedalus, blocks: [] },
    { id: FACTIONS.Illuminati, blocks: [] },
]
