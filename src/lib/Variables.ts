import { SourceFileLvl } from "Bitburner";

// Set a fixed amount of RAM to reserve on home for non-Phoenix scripts.
export const RESERVED_HOME_RAM = 16;

// manual required prior to BN5; if BN5, just set {n: 5, lvl: 1} and the rest will be calculated
export const BITNODES_COMPLETED: SourceFileLvl[] = [
    {n: 1, lvl: 1},
    {n: 2, lvl: 0},
    {n: 3, lvl: 0},
    {n: 4, lvl: 0},
    {n: 5, lvl: 0},
    {n: 6, lvl: 0},
    {n: 7, lvl: 0},
    {n: 8, lvl: 0},
    {n: 9, lvl: 0},
    {n: 10, lvl: 0},
    {n: 11, lvl: 0},
    {n: 12, lvl: 0},
    {n: 13, lvl: 0},
    {n: 14, lvl: 0},
    {n: 15, lvl: 0},
    {n: 16, lvl: 0},
    {n: 17, lvl: 0}
]

export const CURRENT_BITNODE: number = 8;


export enum PORTS {
    control = 1,
    servers,
    heartbeat,
}

export enum CONTROL_SEQUENCES {
    SIGHUP = 1,
    PAUSE
}

export enum SYS_FILES {
    KEEPALIVE = "/sys/keepalive.js",
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
}
