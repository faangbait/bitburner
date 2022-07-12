import { NS } from "Bitburner";
import { BIN_FILES, PORTS, RESERVED_HOME_RAM } from "lib/Variables";
import { HomeExec } from "Phoenix";

export const ReservedRam = {
    launch_max_reserve_shares(ns: NS, extra = 0) {
        let home = ns.getServer("home");
        let shares = Math.floor(Math.min(home.maxRam - home.ramUsed, extra + RESERVED_HOME_RAM) / 4);
        if (shares > 0) { return ns.exec(BIN_FILES.SWAP_RAM,"home",shares) } else { return 0 }
    },

    async use(ns: NS, script: string, threads: number = 1, args: (string | number | boolean)[] = []) {
        let request: HomeExec = {
            file: script,
            threads: threads,
            home_required: true,
            args: args
        }

        await ns.tryWritePort(PORTS.swap, JSON.stringify(request))
        let relaunch = 0;

        while (relaunch === 0) { 
            relaunch = ReservedRam.launch_max_reserve_shares(ns);
            await ns.asleep(1000) 
        }
    }
}
