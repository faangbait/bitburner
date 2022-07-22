/**
 * Note: File meant to be used by loader apps, not the main script
 */
import { NS } from "Bitburner";
import { AugmentationNames, Augmentations, AugStats } from "modules/augmentations/AugmentationEnums";

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

    constructor(ns: NS, name: string) {
        this.id = name;
        this.name = name;
        this.prereqs = this.prereqs ? this.prereqs : [];
        
        this.stats = {
            agility: {
                exp: 1,
                level: 1,
            },
            charisma: {
                exp: 1,
                level: 1,
            },
            defense: {
                exp: 1,
                level: 1,
            },
            dexterity: {
                exp: 1,
                level: 1,
            },
            strength: {
                exp: 1,
                level: 1,
            },
            bladeburner: {
                analysis: 1,
                max_stam: 1,
                stam_gain: 1,
                success: 1,
            },
            crime: {
                money: 1,
                success: 1,
            },
            company: {
                rep: 1,
                work: 1,
            },
            faction: {
                rep: 1,
            },
            hacking: {
                chance: 1,
                exp: 1,
                grow: 1,
                money: 1,
                level: 1,
                speed: 1,
            },
            hacknet: {
                core: 1,
                level: 1,
                node: 1,
                ram: 1,
                production: 1,
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
export const AugmentationInfo = {
    all(ns: NS): Augmentation[] {
        let augmentations: Augmentation[] = [];
        for (const aug in AugmentationNames) {
            augmentations.push(new Augmentation(ns, AugmentationNames[aug]))
        }
        return augmentations
    },

    detail(ns: NS, aug_name: string) {
        return new Augmentation(ns, aug_name);
    }
}
