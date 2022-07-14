/**
 * Note: File meant to be used by loader apps, not the main script
 */
import { NS } from "Bitburner";
import { Factions } from "modules/factions/FactionEnums";
import { AugmentationNames, Augmentations, AugStats } from "./AugmentationEnums";

class Augmentation {
    id: string;
    baseCost = 0;
    baseRepRequirement = 0;
    name = "";
    prereqs: string[] = [];
    factions: string[] = [];
    stats: AugStats;
    owned = false;
    installed = false;

    constructor(ns: NS, name: string, moneyCost: number, repCost: number, factions: string[]) {
        this.id = AugmentationNames[name];
        this.name = name;
        this.prereqs = this.prereqs ? this.prereqs : [];
        this.baseRepRequirement = repCost;
        Object.freeze(this.baseRepRequirement);
        this.baseCost = moneyCost;
        Object.freeze(this.baseCost);
        this.factions = factions;
        this.owned = ns.singularity.getOwnedAugmentations(true).includes(name);
        this.installed = ns.singularity.getOwnedAugmentations(false).includes(name);

        let stats = ns.singularity.getAugmentationStats(name);

        this.stats = {
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
    }
}

// export const AugModule = {
//     async init(ns: NS) {},
//     async loop(ns: NS) {},
//     all(ns: NS) {},
//     detail(ns: NS) {},
//     calculate_costs(augmentations: Augmentation[]): number {},
//     create_augmentation_graph(augmentations: Augmentation[]): Graph {},
//     generate_fastest_route(augmentation_graph: Graph): Augmentation[] {}
// }

/**
 * Returns a list of Augmentation objects
 */
export const get_augmentations = (ns: NS) => {
    for (const aug_name in AugmentationNames) {
        const price = ns.singularity.getAugmentationPrice(aug_name);
        const rep_req = ns.singularity.getAugmentationRepReq(aug_name);
        const factions = Array.from(Factions.keys()).filter(f => ns.singularity.getAugmentationsFromFaction(f).includes(aug_name))
        Augmentations[aug_name] = new Augmentation(ns, aug_name, price, rep_req, factions)
    }

    return Augmentations;
}
