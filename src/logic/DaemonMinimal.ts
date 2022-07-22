import { NS } from "Bitburner";
import { CONTROL_SEQUENCES, PORTS } from "lib/Database";
import { SINGULARITY_SCRIPTS, SYS_SCRIPTS } from "lib/Variables";
import DaemonDefault from "logic/DaemonDefault";
import { AugCache } from "modules/augmentations/AugmentationCache";
import { PlayerObject } from "modules/players/PlayerEnums";
import { PlayerInfo } from "modules/players/Players";
import { DeploymentBundle, ServerObject } from "modules/servers/ServerEnums";
import { ServerFuncs } from "modules/servers/ServerFunctions";
import { ServerInfo } from "modules/servers/Servers";
import { Sing } from "modules/Singularity";

/**
 * Will run until we have > 256 GB of Server RAM
 * Goal: Increase home RAM > 256 GB
 */
export default class DaemonMinimal extends DaemonDefault {
    constructor(ns: NS) {
        super(ns);
        this.max_ports = 2
        this.module = "DAEMON_MINIMAL"
    }

    active(ns: NS, servers: ServerObject[], player: PlayerObject): boolean {
        return ServerInfo.detail(ns, "home").ram.trueMax <= 256
    }

    escape(ns: NS, servers: ServerObject[], player: PlayerObject): boolean {
        let augments = AugCache.all(ns);
        let augs_owned = Array.from(augments.values()).filter(a => a.owned).length;
        let augs_installed = Array.from(augments.values()).filter(a => a.installed).length;

        return ServerInfo.detail(ns, "home").ram.trueMax > 256 || augs_owned > augs_installed
    }

    disqualify_target(ns: NS, t: ServerObject): boolean {
        return t.level > 5
    }

    generate_money_bundle(ns: NS): DeploymentBundle[] {
        let bundles: DeploymentBundle[] = [];
        let player = PlayerInfo.detail(ns);

        if (player.ports < this.max_ports) {
            let target = {
                0: 7e5,
                1: 1.5e6,
                2: 5e6,
                3: 3e7,
                4: 2.5e8
            };
            if (player.money > target[player.ports] && player.ports < this.max_ports) {
                bundles.push(...this.__buy_software(ns))
            }
        }

        if (
            ServerFuncs.get_processes(ns, "home", SYS_SCRIPTS.HACKNET).length > 0 &&
            !player.faction.membership.includes("Netburners") &&
            ![8].includes(this.bn)
        ) {
            bundles.push({
                file: SYS_SCRIPTS.HACKNET
            })
        }

        if (player.market.api.tix) {
            switch (ns.peek(PORTS.control)) {
                case CONTROL_SEQUENCES.LIQUIDATE_CAPITAL:
                    if (ServerFuncs.get_processes(ns, "home", SYS_SCRIPTS.MARKET).length > 0) {
                        bundles.push({
                            file: SYS_SCRIPTS.MARKET,
                            args: ["-l"]
                        })
                    }
                    break;
                default:
                    if (ServerFuncs.get_processes(ns, "home", SYS_SCRIPTS.MARKET).length === 0) {
                        bundles.push({
                            file: SYS_SCRIPTS.MARKET,
                        })
                    }
                    break;
            }
        }

        bundles.push(...this.__upgrade_home(ns, "ram"))

        return bundles
    }
}
