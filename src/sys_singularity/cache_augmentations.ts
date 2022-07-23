import { NS } from "Bitburner";
import { AugmentationInfo } from "modules/augmentations/Augmentations";
import { AugCache } from "modules/augmentations/AugmentationCache";
import { Factions } from "modules/factions/FactionEnums";
import { Sing } from "modules/Singularity";
import { AugmentationFuncs } from "modules/augmentations/AugmentationFunctions";
import { AugmentationNames } from "modules/augmentations/AugmentationEnums";

export const main = async (ns: NS) => {
    if (!Sing.has_access(ns)) { return }
    let wanted_augs = AugmentationFuncs.get_augmentation_path(ns)
    for (const aug of AugmentationInfo.all(ns)) {
        if (!aug) { continue; }
        aug.owned = ns.singularity.getOwnedAugmentations(true).includes(aug.name);
        aug.installed = ns.singularity.getOwnedAugmentations(false).includes(aug.name);
        aug.wanted = wanted_augs.filter(a => a && a.name).map(a => a.name).includes(aug.name)
        
        let stats = ns.singularity.getAugmentationStats(aug.name);
        aug.stats = {
            agility: {
                exp: stats.agility_exp_mult || 1,
                level: stats.agility_mult || 1,
            },
            charisma: {
                exp: stats.charisma_exp_mult || 1,
                level: stats.charisma_mult || 1,
            },
            defense: {
                exp: stats.defense_exp_mult || 1,
                level: stats.defense_mult || 1,
            },
            dexterity: {
                exp: stats.defense_exp_mult || 1,
                level: stats.dexterity_mult || 1,
            },
            strength: {
                exp: stats.strength_exp_mult || 1,
                level: stats.strength_mult || 1,
            },
            bladeburner: {
                analysis: stats.bladeburner_analysis_mult || 1,
                max_stam: stats.bladeburner_max_stamina_mult || 1,
                stam_gain: stats.bladeburner_stamina_gain_mult || 1,
                success: stats.bladeburner_success_chance_mult || 1
            },
            crime: {
                money: stats.crime_money_mult || 1,
                success: stats.crime_success_mult || 1
            },
            company: {
                rep: stats.company_rep_mult || 1,
                work: stats.work_money_mult || 1
            },
            faction: {
                rep: stats.faction_rep_mult || 1,
            },
            hacking: {
                chance: stats.hacking_chance_mult || 1,
                exp: stats.hacking_exp_mult || 1,
                grow: stats.hacking_grow_mult || 1,
                money: stats.hacking_money_mult || 1,
                level: stats.hacking_mult || 1,
                speed: stats.hacking_speed_mult || 1
            },
            hacknet: {
                core: stats.hacknet_node_core_cost_mult || 1,
                level: stats.hacknet_node_level_cost_mult || 1,
                node: stats.hacknet_node_purchase_cost_mult || 1,
                ram: stats.hacknet_node_ram_cost_mult || 1,
                production: stats.hacknet_node_money_mult || 1
            }
        }

        aug.baseCost = ns.singularity.getAugmentationPrice(aug.name);
        aug.baseRepRequirement = ns.singularity.getAugmentationRepReq(aug.name);
        aug.factions = Array.from(Factions.keys()).filter(f => ns.singularity.getAugmentationsFromFaction(f).includes(aug.name))
        
        await AugCache.update(ns, aug)
    }
}
