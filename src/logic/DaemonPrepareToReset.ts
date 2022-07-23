import { NS } from "Bitburner";
import { CONTROL_SEQUENCES } from "lib/Database";
import { SINGULARITY_SCRIPTS } from "lib/Variables";
import DaemonDefault from "logic/DaemonDefault";
import { AugCache } from "modules/augmentations/AugmentationCache";
import { AugmentationNames } from "modules/augmentations/AugmentationEnums";
import { AugmentationFuncs } from "modules/augmentations/AugmentationFunctions";
import { FactionCache } from "modules/factions/FactionCache";
import { FactionFuncs } from "modules/factions/FactionFunctions";
import { PlayerObject } from "modules/players/PlayerEnums";
import { PlayerInfo } from "modules/players/Players";
import { ServerCache } from "modules/servers/ServerCache";
import { DeploymentBundle, ServerObject } from "modules/servers/ServerEnums";
import { ServerInfo } from "modules/servers/Servers";

/**
 * Runs when owned augs > 1; basically we buy our best aug to start this script
 */
export default class DaemonPrepareToReset extends DaemonDefault {
    constructor(ns: NS) {
        super(ns);
        this.module = "DAEMON_PREPRESET"
        this.max_ports = 0;
    }

    active(ns: NS, servers: ServerObject[], player: PlayerObject): boolean {
        let augments = AugCache.all(ns);
        let augs_owned = Array.from(augments.values()).filter(a => a.owned);
        let augs_installed = Array.from(augments.values()).filter(a => a.installed);
        
        let augs_wanted = Array.from(augments.values()).filter(a => a.wanted);
        let augs_wanted_names = augs_wanted.map(aug => aug.name)

        let factions = Array.from(FactionCache.all(ns).values()).filter(f => f.member);

        for (const faction of factions) {
            let faction_wanted = faction.augmentations.filter(a => augs_wanted_names.includes(a)).map(a => AugCache.read(ns, a))
            
            if (faction_wanted.length > 0 && faction_wanted.every(a => a.baseRepRequirement <= faction.rep)) {
                let faction_augs_cost = AugmentationFuncs.calculate_costs(ns, faction_wanted)
                if (faction_augs_cost < player.money && (player.market.api.fourSigma || faction_augs_cost < 1e9)) {
                    return true
                }
            }
        }
        

        return augs_owned.length > augs_installed.length
    }

    escape(ns: NS, servers: ServerObject[], player: PlayerObject): boolean {
        let augments = AugCache.all(ns);
        let augs_installed = Array.from(augments.values()).filter(a => a.installed).length;
        return augs_installed >= this.bn_mults.augmentations.daedalus_req
    }
    
    set_control_sequence(ns: NS): CONTROL_SEQUENCES | null {
        if (this.__get_targets(ns, ServerInfo.all(ns)).length == 0) {
            return CONTROL_SEQUENCES.LIQUIDATE_CAPITAL
        }
        return null
    }

    disqualify_target(ns: NS, t: ServerObject): boolean {
        return t.level >= 100 || t.money.available <= 1e4
    }

    generate_hacking_bundle(ns: NS, attackers: ServerObject[], targets: ServerObject[]): DeploymentBundle[] {
        if (targets.length === 0) {
            return [{
                file: SINGULARITY_SCRIPTS.PREPARE_FOR_RESET,
                priority: -100
            }]
        }
        return this.__hack_cash(ns, attackers, targets)
    }
}
