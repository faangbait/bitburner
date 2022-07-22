/**
 * @typedef {import(".").NS} ns
 * 
 * @argument {boolean} softreset if true, resets without augs. default installs augs.
 *
 * @export
 * @param {ns} ns
 */


import { NS } from "Bitburner";
import { CORE_RUNTIMES } from "lib/Variables";
import { AugmentationFuncs } from "modules/augmentations/AugmentationFunctions";
import { BitNodeCache } from "modules/bitnodes/BitnodeCache";
import { FactionCache } from "modules/factions/FactionCache";
import { FactionFuncs } from "modules/factions/FactionFunctions";
import { PlayerCache } from "modules/players/PlayerCache";

export async function main(ns: NS) {
    ns.tprint("Preparing to purchase augs and reset")
    ns.singularity.stopAction();
    await ns.sleep(10000);

    let args = ns.args;

    let soft = args[0];

    if (typeof soft !== "boolean" ) { soft = false }

    let player = PlayerCache.read(ns, 'player');
    let factions = FactionCache.all(ns);
    let bn = BitNodeCache.read(ns, 'current');
    
    let faction_donation: string | undefined = undefined;

    if (!soft) {
        let desired_augs = AugmentationFuncs.get_augmentation_path(ns)
        let sorted = Array.from(desired_augs.values()).filter(a => !a.owned).sort((a,b) => b.baseCost - a.baseCost)
    
        for (const aug of sorted) {
            let faction = Array.from(factions.values()).find(f => f.rep >= aug.baseRepRequirement * bn.multipliers.augmentations.rep)
            if (faction) {
                if (ns.singularity.purchaseAugmentation(faction.name, aug.name)){ aug.owned = true };
            }
        }

        
        while(ns.singularity.purchaseAugmentation(Array.from(factions.values()).sort((a,b) => b.rep - a.rep)[0].name,"NeuroFlux Governor")) {
            await ns.sleep(1)
        }
      
        faction_donation = player.faction.membership.find(f => 
            sorted.some(a => !a.owned && a.factions.includes(f)) && // a faction we're a member of has an aug we need
            FactionFuncs.min_donation_favor(ns) >= FactionCache.read(ns, f).favor // we can donate to the faction
            )
    }

    while (ns.singularity.upgradeHomeRam()) {}
    while (ns.singularity.upgradeHomeCores()) {}

    if (faction_donation) {
        await ns.sleep(10000) // wait for cache to update
        player = PlayerCache.read(ns, 'player');
        ns.singularity.donateToFaction(faction_donation, player.money);
    }
    
    try {
        if (!soft) {
            ns.singularity.installAugmentations(CORE_RUNTIMES.LAUNCHER)
        } else {
            ns.singularity.softReset(CORE_RUNTIMES.LAUNCHER)
        }
    } catch {
        if (!soft) {
            ns.tprint(`Ready to install augmentations.`)
        } else {
            ns.tprint(`Ready for soft reset.`)
        }
    }
}
