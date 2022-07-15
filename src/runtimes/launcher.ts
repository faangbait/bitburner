import { NS } from "Bitburner";
import { MOTD } from "lib/Motd";
import { CORE_RUNTIMES, SYS_SCRIPTS, TEMP_F } from "lib/Variables";
import { PORTS } from "lib/Database";
import { CACHE_SCRIPTS } from "lib/Database";
import { TermLogger } from "lib/Logger";

async function launch_and_wait(ns: NS, script: CACHE_SCRIPTS, threads = 1, args: (string | number | boolean)[] = []) {
    let pid = ns.run(CACHE_SCRIPTS[script], threads, ...args);
    await ns.sleep(100);
    while (ns.isRunning(pid)) { await ns.sleep(10); }
}

// max 32gb
export async function main(ns: NS) {
    let args = ns.args;
    let logger = new TermLogger(ns);

    let current_bitnode = args[0];
    if (typeof current_bitnode !== "number") {
        current_bitnode = ns.read(TEMP_F[TEMP_F.CURRENT_BITNODE]);
        if (typeof current_bitnode !== "number") {
            logger.err("Couldn't detect current BitNode; please relaunch with current BitNode as an argument.");
            return
        }
    }

    ns.write(TEMP_F[TEMP_F.CURRENT_BITNODE], current_bitnode, "w");

    MOTD.banner(ns);
    logger.info(`Detected BitNode ${current_bitnode}`);
    await launch_and_wait(ns, CACHE_SCRIPTS.BITNODES, 1, [current_bitnode]);

    Array.from(Object.keys(PORTS)).forEach(port => ns.clearPort(PORTS[port]));

    for (const script of [
        CACHE_SCRIPTS.AUGMENTATIONS, 
        CACHE_SCRIPTS.FACTIONS,
        CACHE_SCRIPTS.PLAYERS,
        CACHE_SCRIPTS.SERVERS,
        CACHE_SCRIPTS.CORPORATIONS,
        CACHE_SCRIPTS.CRIMES,
        CACHE_SCRIPTS.SLEEVES
    ]) {
        await launch_and_wait(ns, script);
    }

    if (ns.getServerMaxRam("home") >= 32) {
        ns.spawn(CORE_RUNTIMES.PHOENIX)
    } else { ns.spawn(CORE_RUNTIMES.TUCSON) }
}
