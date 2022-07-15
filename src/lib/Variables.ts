/**
 * Note: File is meant to be zero ram and imported
 */


export enum CORE_RUNTIMES {
    PHOENIX = "/runtimes/phoenix.js",
    TUCSON = "/runtimes/tucson.js",
    KEEPALIVE = "/runtimes/keepalive.js",
    LAUNCHER = "/runtimes/launcher.js"
}

export enum SYS_SCRIPTS {
    HACKNET = "/sys/hacknet.js",
    PURCHASE_SVR = "/sys/manage_servers.js",
    MARKET = "/sys/stockmaster.js",
    MONITOR = "/sys/monitor.js",
    SWAP_RAM = "/sys/swap_ram.js",
    LEETCODE = "/sys/fetch_and_solve_leetcode.js"
}

export enum BIN_SCRIPTS {
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


export enum SINGULARITY_SCRIPTS {
    FACTION_JOIN = "/sys_singularity/faction_join.js",
    FACTION_DONATE = "/sys_singularity/donate_to_faction.js",
    FACTION_WORK = "/sys_singularity/work_faction.js",
    COMPANY_WORK = "/sys_singularity/work_company.js",
    MANAGE_SOFTWARE = "/sys_singularity/software_manager.js",
    CONNECT_SERVER = "/sys_singularity/connect_backdoor.js",
    TRAVEL = "/sys_singularity/travel.js",
    PREPARE_FOR_RESET = "/sys_singularity/prepare_for_reset.js",
    DESTROY_DAEMON = "/sys_singularity/destroy_world_daemon.js",
}

export enum TEMP_F {
    CURRENT_BITNODE = "/Temp/BitNode.txt",
}
