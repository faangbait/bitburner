import { NS } from "Bitburner";
import { BIN_FILES, RESERVED_HOME_RAM } from "lib/Variables";

export const ReservedRam = {
    launch_max_reserve_shares(ns: NS) {
        let home = ns.getServer("home");
        let shares = Math.floor(Math.min(home.maxRam - home.ramUsed, RESERVED_HOME_RAM) / 4);
        if (shares > 0) { ns.exec(BIN_FILES.RESERVED_SHARE.toString(), "home", shares) }
    },

    use(ns: NS, script: string, threads: number = 1, args: (string | number | boolean)[] = []) {
        let swap = ns.ps("home").filter(p => p.filename === BIN_FILES.RESERVED_SHARE.toString());

        if (swap.length > 0) {
            swap.forEach(p => ns.kill(p.pid));
            let using_pid = ns.exec(script, "home", threads, ...args);
            ReservedRam.launch_max_reserve_shares(ns);
            ReservedRam.watch(ns, using_pid)
        }
    },

    async watch(ns: NS, using_pid: number) {
        while (ns.ps("home").filter(p => p.pid === using_pid)) {
            await ns.asleep(500);
        }
        ns.ps("home").filter(p => p.filename === BIN_FILES.RESERVED_SHARE.toString()).forEach(p => ns.kill(p.pid))
        ReservedRam.launch_max_reserve_shares(ns);
    }
}
