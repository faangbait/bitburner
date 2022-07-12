import { NS } from "Bitburner";
import { PlayerObject, ServerObject } from "Phoenix";
import { TermLogger } from "lib/Helpers";
import { PInfo } from "lib/Players";
import { SInfo } from "lib/Servers";
import { ReservedRam } from "lib/Swap";
import { FACTION_MODEL, SINGULARITY_FILES, SYS_FILES } from "lib/Variables";
import { GameState } from "lib/GameState";

export const SingularityModule = {
    async init(ns: NS) {
        let servers = SInfo.all(ns);
        let player = PInfo.detail(ns);
        const logger = new TermLogger(ns);
        logger.log("Singularity Enabled")
    },

    async manage_software(ns: NS, player: PlayerObject) {
        if (!player.software.tor  ||
            !player.software.ssh  ||
            !player.software.ftp  ||
            !player.software.smtp ||
            !player.software.http ||
            !player.software.sql) {
                await ReservedRam.use(ns, SINGULARITY_FILES.MANAGE_SOFTWARE)
            }
    },

    async manage_home_upgrades(ns: NS, player: PlayerObject) {
        let home = SInfo.detail(ns, "home");
    },

    async manage_faction_membership(ns: NS, player: PlayerObject) {
        for (const inv of FACTION_MODEL.filter(f => ns.singularity.checkFactionInvitations().includes(f.id))) {
            if (inv.blocks.length === 0) {
                await ReservedRam.use(ns, SINGULARITY_FILES.JOIN_FACTION,1, [inv.id])
            } else {
                // decide if we want to join the faction
            }
        }
        
        
        let daemon = SInfo.detail(ns, "w0r1dd43m0n")
        if (daemon) {
            if (daemon.admin) {
                if (!daemon.backdoored) {
                    if (daemon.level <= player.hacking.level) {
                        SInfo.detail(ns, "home").pids.filter(p => p.filename !== SYS_FILES.PHOENIX).forEach(p => ns.kill(p.pid))
                        await ReservedRam.use(ns, SINGULARITY_FILES.CONNECT_SERVER, 1, [daemon.id, true]);
                    }
                } else {
                    let bitnodes = Array.from(GameState.read(ns).sourcefiles.entries()).filter(([n,lvl]) => lvl < 3);
                    if (bitnodes.length === 0) { bitnodes = [[12,0]] }

                    bitnodes.sort(([a_n, a_lvl],[b_n, b_lvl]) => a_lvl - b_lvl)
                    SInfo.detail(ns, "home").pids.filter(p => p.filename !== SYS_FILES.PHOENIX).forEach(p => ns.kill(p.pid))
                    await ReservedRam.use(ns, SINGULARITY_FILES.DESTROY_DAEMON, 1, [bitnodes[0][0]]);
                }
            }
        }
    },

    async loop(ns: NS) {
        let servers = SInfo.all(ns);
        let player = PInfo.detail(ns);
        const logger = new TermLogger(ns);

        SingularityModule.manage_software(ns, player);
        await SingularityModule.manage_faction_membership(ns, player);
        SingularityModule.manage_home_upgrades(ns, player);
    }
}

