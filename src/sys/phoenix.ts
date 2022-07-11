import { NS } from "Bitburner";
import { TermLogger } from "lib/Helpers";
import { SInfo } from "lib/Servers";
import { PInfo } from "lib/Players";
import { HackingStrategy, MoneyStrategy, Singularity, Factions, Corps, Crimes, LeetCode, Sleeves } from "lib/Config";
import { PORTS, SYS_FILES } from "lib/Variables";
import { ReservedRam } from "lib/Swap";
import { MOTD } from "lib/Motd";

export async function main(ns: NS) {
    ns.disableLog("ALL");
    ns.enableLog("exec");
    ns.tail();

    const logger = new TermLogger(ns);

    let start_time = performance.now();

    await init(ns);
    await Singularity.init(ns);
    await Factions.init(ns);
    await Corps.init(ns);
    await Crimes.init(ns);
    await LeetCode.init(ns);
    await Sleeves.init(ns);
    await MoneyStrategy.init(ns);
    await HackingStrategy.init(ns);

    logger.log(`Initialization completed in ${ns.nFormat(performance.now() - start_time, '0.0a')} milliseconds`)

    Singularity.loop(ns).catch(console.error);
    Factions.loop(ns).catch(console.error);
    Corps.loop(ns).catch(console.error);
    Crimes.loop(ns).catch(console.error);
    LeetCode.loop(ns).catch(console.error);
    Sleeves.loop(ns).catch(console.error);
    MoneyStrategy.loop(ns).catch(console.error);
    HackingStrategy.loop(ns).catch(console.error);
    
   
    while (true) {
        // await heartbeat(ns);
        await ns.asleep(1000);
    }
}

async function init(ns: NS) {
    ns.clearPort(PORTS.control);
    ns.clearPort(PORTS.heartbeat);
    ns.clearPort(PORTS.servers);
    
    let sList = SInfo.names(ns);

    for (const s of sList) {
        await SInfo.update_cache(ns, s, false)
        SInfo.update_cache(ns, s).catch(console.error);
        await ns.asleep(79);
    }

    let servers = sList.map(s => SInfo.detail(ns, s));
    let player = PInfo.detail(ns);

    // kill all non-phoenix files on boot
    servers.filter(s => s.id !== "home")
        .forEach(s => s.pids.forEach(p => ns.kill(p.pid)))

    servers.filter(s => s.id === "home").forEach(
        s => s.pids.filter(p => ![SYS_FILES.KEEPALIVE.toString(), SYS_FILES.PHOENIX.toString()].includes(p.filename))
            .forEach(p => ns.kill(p.pid))
    )

    ReservedRam.launch_max_reserve_shares(ns);

    MOTD.banner_short(ns);
    return { servers, player }
}

async function heartbeat(ns: NS) {
    if (SInfo.detail(ns, "home").ram.trueMax >= 32) {
        ns.clearPort(PORTS.heartbeat);
        await ns.writePort(PORTS.heartbeat, new Date().valueOf());
        if (ns.ps("home").every(p => p.filename != SYS_FILES.KEEPALIVE.toString())) {
            ns.exec(SYS_FILES.KEEPALIVE, "home")
        }
    }
}
