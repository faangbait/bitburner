/**
 * @typedef {import(".").NS} ns
 * 
 * @export
 * @param {ns} ns
 */

import { NS } from "Bitburner";
import { GameState } from "lib/GameState";
import { TermLogger } from "lib/Helpers";
import { AUGMENTATIONS, FACTION_MODEL, PORTS } from "lib/Variables";
import { AugmentationObject } from "Phoenix";

export const get_object = (ns: NS, augName: string): AugmentationObject => {
    let stats = ns.singularity.getAugmentationStats(augName);

    return {
        id: AUGMENTATIONS[augName],
        name: augName,
        owned: ns.singularity.getOwnedAugmentations(true).includes(augName),
        installed: ns.singularity.getOwnedAugmentations(false).includes(augName),
        factions: Array.from(FACTION_MODEL.keys()).filter(f => ns.singularity.getAugmentationsFromFaction(f).includes(augName)),
        reqs: {
            rep: ns.singularity.getAugmentationRepReq(augName),
            price: ns.singularity.getAugmentationPrice(augName),
            prereqs: ns.singularity.getAugmentationPrereq(augName).map(a => get_object(ns, a)),
        },
        stats: {
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

export async function main(ns: NS) {
    let logger = new TermLogger(ns);

    let aug_list: string[] = Object.keys(AUGMENTATIONS).map(key => AUGMENTATIONS[key]).filter(value => typeof value === 'string');
    let filtered_augs: string[] = [];
    switch (GameState.read(ns).bitnode.current) {
        case 1: // 30 / 3000
            filtered_augs = aug_list.filter(a => [
                //Hacking
                AUGMENTATIONS.CashRoot,
                AUGMENTATIONS.Neuralstimulator,
                AUGMENTATIONS.Neurotrainer1,
                AUGMENTATIONS.Neurotrainer2,
                AUGMENTATIONS.CranialSignalProcessorsG1,
                AUGMENTATIONS.CranialSignalProcessorsG2,
                AUGMENTATIONS.CranialSignalProcessorsG3,
                AUGMENTATIONS.CranialSignalProcessorsG4,
                AUGMENTATIONS.CranialSignalProcessorsG5,
                AUGMENTATIONS.BitWire,
                AUGMENTATIONS.SynapticEnhancement,
                AUGMENTATIONS.ArtificialSynapticPotentiation,
                AUGMENTATIONS.ENM,
                AUGMENTATIONS.ENMCore,
                AUGMENTATIONS.ENMCoreV2,
                AUGMENTATIONS.NeuralRetentionEnhancement,
                AUGMENTATIONS.CRTX42AA,
                AUGMENTATIONS.DataJack,
                AUGMENTATIONS.EnhancedMyelinSheathing,
                AUGMENTATIONS.TheBlackHand,
                AUGMENTATIONS.ArtificialBioNeuralNetwork,
                AUGMENTATIONS.NeuralAccelerator,
                AUGMENTATIONS.Neurolink,
                //Social
                AUGMENTATIONS.SNA,
                AUGMENTATIONS.ADRPheromone1,
                AUGMENTATIONS.Neuregen,
                //Hacknet
                AUGMENTATIONS.HacknetNodeCPUUpload,
                AUGMENTATIONS.HacknetNodeCacheUpload,
                AUGMENTATIONS.HacknetNodeCoreDNI,
                AUGMENTATIONS.HacknetNodeKernelDNI, // 30
                AUGMENTATIONS.HacknetNodeNICUpload,
                // Always
                AUGMENTATIONS.NeuroFluxGovernor,
                // POST DAEDALUS
                AUGMENTATIONS.ENMCoreV3,
                AUGMENTATIONS.ENMAnalyzeEngine,
                AUGMENTATIONS.ENMDMA,
                AUGMENTATIONS.TheRedPill,
            ].includes(AUGMENTATIONS[a]))
            break;
        case 2: // 30 / 15000
            filtered_augs = aug_list.filter(a => [
                // Hacknet
                AUGMENTATIONS.HacknetNodeCPUUpload,
                AUGMENTATIONS.HacknetNodeCacheUpload,
                AUGMENTATIONS.HacknetNodeCoreDNI,
                AUGMENTATIONS.HacknetNodeKernelDNI, 
                AUGMENTATIONS.HacknetNodeNICUpload, // 5
                //Hacking
                AUGMENTATIONS.CashRoot,
                AUGMENTATIONS.Neuralstimulator,
                AUGMENTATIONS.Neurotrainer1,
                AUGMENTATIONS.Neurotrainer2,
                AUGMENTATIONS.CranialSignalProcessorsG1,
                AUGMENTATIONS.CranialSignalProcessorsG2,
                AUGMENTATIONS.CranialSignalProcessorsG3,
                AUGMENTATIONS.CranialSignalProcessorsG4,
                AUGMENTATIONS.CranialSignalProcessorsG5,
                AUGMENTATIONS.BitWire,
                AUGMENTATIONS.SynapticEnhancement,
                AUGMENTATIONS.ArtificialSynapticPotentiation,
                AUGMENTATIONS.ENM,
                AUGMENTATIONS.ENMCore,
                AUGMENTATIONS.ENMCoreV2,
                AUGMENTATIONS.NeuralRetentionEnhancement,
                AUGMENTATIONS.CRTX42AA,
                AUGMENTATIONS.DataJack,
                AUGMENTATIONS.EnhancedMyelinSheathing,
                AUGMENTATIONS.TheBlackHand,
                AUGMENTATIONS.ArtificialBioNeuralNetwork,
                AUGMENTATIONS.NeuralAccelerator,
                AUGMENTATIONS.Neurolink,
                //Social
                AUGMENTATIONS.SNA,
                AUGMENTATIONS.ADRPheromone1, //30
                AUGMENTATIONS.Neuregen,
                //Combat
                AUGMENTATIONS.LuminCloaking1,
                AUGMENTATIONS.LuminCloaking2,
                AUGMENTATIONS.SmartSonar,
                AUGMENTATIONS.PCMatrix, 
                AUGMENTATIONS.INFRARet,
                AUGMENTATIONS.Targeting1,
                AUGMENTATIONS.Targeting2,
                AUGMENTATIONS.CombatRib1,
                AUGMENTATIONS.NanofiberWeave,
                AUGMENTATIONS.NutriGen,

                // Always
                AUGMENTATIONS.NeuroFluxGovernor,
                
                // POST DAEDALUS
                AUGMENTATIONS.GrapheneBrachiBlades,
                AUGMENTATIONS.BrachiBlades,
                AUGMENTATIONS.HemoRecirculator,
                AUGMENTATIONS.TheRedPill


            ].includes(AUGMENTATIONS[a]))
            break;
        case 3: // 30 / 6000
            filtered_augs = aug_list.filter(a => 
                [
                    //Hacknet
                    AUGMENTATIONS.HacknetNodeCPUUpload,
                    AUGMENTATIONS.HacknetNodeCacheUpload,
                    AUGMENTATIONS.HacknetNodeCoreDNI,
                    AUGMENTATIONS.HacknetNodeKernelDNI, 
                    AUGMENTATIONS.HacknetNodeNICUpload, // 5
                    // Hacking
                    AUGMENTATIONS.CashRoot,
                    AUGMENTATIONS.Neuralstimulator,
                    AUGMENTATIONS.Neurotrainer1,
                    AUGMENTATIONS.Neurotrainer2,
                    AUGMENTATIONS.CranialSignalProcessorsG1,
                    AUGMENTATIONS.CranialSignalProcessorsG2,
                    AUGMENTATIONS.CranialSignalProcessorsG3,
                    AUGMENTATIONS.CranialSignalProcessorsG4,
                    AUGMENTATIONS.CranialSignalProcessorsG5,
                    AUGMENTATIONS.BitWire,
                    AUGMENTATIONS.SynapticEnhancement,
                    AUGMENTATIONS.ArtificialSynapticPotentiation,
                    AUGMENTATIONS.ENM,
                    AUGMENTATIONS.ENMCore,
                    AUGMENTATIONS.ENMCoreV2,
                    AUGMENTATIONS.NeuralRetentionEnhancement,
                    AUGMENTATIONS.CRTX42AA,
                    AUGMENTATIONS.DataJack,
                    AUGMENTATIONS.EnhancedMyelinSheathing,
                    AUGMENTATIONS.TheBlackHand,
                    AUGMENTATIONS.ArtificialBioNeuralNetwork,
                    AUGMENTATIONS.NeuralAccelerator,
                    AUGMENTATIONS.Neurolink,
                    // Social
                    AUGMENTATIONS.SNA,
                    AUGMENTATIONS.ADRPheromone1, //30
    
                    // Always
                    AUGMENTATIONS.NeuroFluxGovernor,
                    // POST DAEDALUS
                    AUGMENTATIONS.TheRedPill
                ].includes(AUGMENTATIONS[a])
                )
            break;
        case 4: //30 / 9000
            filtered_augs = aug_list.filter(a => 
                [
                    // Hacking
                    AUGMENTATIONS.CashRoot,
                    AUGMENTATIONS.Neuralstimulator,
                    AUGMENTATIONS.Neurotrainer1,
                    AUGMENTATIONS.Neurotrainer2,
                    AUGMENTATIONS.CranialSignalProcessorsG1,
                    AUGMENTATIONS.CranialSignalProcessorsG2,
                    AUGMENTATIONS.CranialSignalProcessorsG3,
                    AUGMENTATIONS.CranialSignalProcessorsG4,
                    AUGMENTATIONS.CranialSignalProcessorsG5,
                    AUGMENTATIONS.BitWire,
                    AUGMENTATIONS.SynapticEnhancement,
                    AUGMENTATIONS.ArtificialSynapticPotentiation,
                    AUGMENTATIONS.ENM,
                    AUGMENTATIONS.ENMCore,
                    AUGMENTATIONS.ENMCoreV2,
                    AUGMENTATIONS.NeuralRetentionEnhancement,
                    AUGMENTATIONS.CRTX42AA,
                    AUGMENTATIONS.DataJack,
                    AUGMENTATIONS.EnhancedMyelinSheathing,
                    AUGMENTATIONS.TheBlackHand, // 20
                    AUGMENTATIONS.ArtificialBioNeuralNetwork,
                    AUGMENTATIONS.NeuralAccelerator,
                    AUGMENTATIONS.Neurolink,
                    // ?
                    // ?
                    // ?
                    // ?
                    // ?
                    // ?
                    
                    // Always
                    AUGMENTATIONS.NeuroFluxGovernor,
                    // POST DAEDALUS
                    AUGMENTATIONS.TheRedPill
                ].includes(AUGMENTATIONS[a])
                )
            break;
        case 5: //30 / 4500
            filtered_augs = aug_list.filter(a => 
                [
                    // Hacknet
                    AUGMENTATIONS.HacknetNodeCPUUpload,
                    AUGMENTATIONS.HacknetNodeCacheUpload,
                    AUGMENTATIONS.HacknetNodeCoreDNI,
                    AUGMENTATIONS.HacknetNodeKernelDNI, 
                    AUGMENTATIONS.HacknetNodeNICUpload, // 5
                    // Hacking
                    AUGMENTATIONS.CashRoot,
                    AUGMENTATIONS.Neuralstimulator,
                    AUGMENTATIONS.Neurotrainer1,
                    AUGMENTATIONS.Neurotrainer2,
                    AUGMENTATIONS.CranialSignalProcessorsG1,
                    AUGMENTATIONS.CranialSignalProcessorsG2,
                    AUGMENTATIONS.CranialSignalProcessorsG3,
                    AUGMENTATIONS.CranialSignalProcessorsG4,
                    AUGMENTATIONS.CranialSignalProcessorsG5,
                    AUGMENTATIONS.BitWire,
                    AUGMENTATIONS.SynapticEnhancement,
                    AUGMENTATIONS.ArtificialSynapticPotentiation,
                    AUGMENTATIONS.ENM,
                    AUGMENTATIONS.ENMCore,
                    AUGMENTATIONS.ENMCoreV2,
                    AUGMENTATIONS.NeuralRetentionEnhancement,
                    AUGMENTATIONS.CRTX42AA,
                    AUGMENTATIONS.DataJack,
                    AUGMENTATIONS.EnhancedMyelinSheathing,
                    AUGMENTATIONS.TheBlackHand,
                    AUGMENTATIONS.ArtificialBioNeuralNetwork,
                    AUGMENTATIONS.NeuralAccelerator,
                    AUGMENTATIONS.Neurolink,
                    // Social
                    AUGMENTATIONS.SNA,
                    AUGMENTATIONS.ADRPheromone1, //30
                    // Always
                    AUGMENTATIONS.NeuroFluxGovernor,
                    // POST DAEDALUS
                    AUGMENTATIONS.TheRedPill
                ].includes(AUGMENTATIONS[a])
                )
            break;      
        case 6: //35 / 6000
            filtered_augs = aug_list.filter(a => 
                [
                    // Hacking
                    AUGMENTATIONS.CashRoot,
                    AUGMENTATIONS.Neuralstimulator,
                    AUGMENTATIONS.Neurotrainer1,
                    AUGMENTATIONS.Neurotrainer2,
                    AUGMENTATIONS.CranialSignalProcessorsG1,
                    AUGMENTATIONS.CranialSignalProcessorsG2,
                    AUGMENTATIONS.CranialSignalProcessorsG3,
                    AUGMENTATIONS.CranialSignalProcessorsG4,
                    AUGMENTATIONS.CranialSignalProcessorsG5,
                    AUGMENTATIONS.BitWire,
                    AUGMENTATIONS.SynapticEnhancement,
                    AUGMENTATIONS.ArtificialSynapticPotentiation,
                    AUGMENTATIONS.ENM,
                    AUGMENTATIONS.ENMCore,
                    AUGMENTATIONS.ENMCoreV2,
                    AUGMENTATIONS.NeuralRetentionEnhancement,
                    AUGMENTATIONS.CRTX42AA,
                    AUGMENTATIONS.DataJack,
                    AUGMENTATIONS.EnhancedMyelinSheathing,
                    AUGMENTATIONS.TheBlackHand,
                    AUGMENTATIONS.ArtificialBioNeuralNetwork,
                    AUGMENTATIONS.NeuralAccelerator,
                    AUGMENTATIONS.Neurolink,
                    // Bladerunner
                    AUGMENTATIONS.EsperEyewear,
                    AUGMENTATIONS.EMS4Recombination,
                    AUGMENTATIONS.OrionShoulder,
                    AUGMENTATIONS.HyperionV1,
                    AUGMENTATIONS.HyperionV2,
                    AUGMENTATIONS.GolemSerum,
                    AUGMENTATIONS.VangelisVirus,
                    AUGMENTATIONS.VangelisVirus3,
                    AUGMENTATIONS.INTERLINKED,
                    AUGMENTATIONS.BladeRunner,
                    AUGMENTATIONS.BladeArmor,
                    AUGMENTATIONS.BladeArmorEnergyShielding,
                    AUGMENTATIONS.BladeArmorUnibeam,
                    AUGMENTATIONS.BladeArmorIPU,
                    AUGMENTATIONS.BladeArmorPowerCells,
                    AUGMENTATIONS.BladesSimulacrum,
                    //Combat
                    AUGMENTATIONS.Targeting1,
                    AUGMENTATIONS.Targeting2,
                    AUGMENTATIONS.WiredReflexes,
                    // Socila
                    AUGMENTATIONS.SNA,
                    // Always
                    AUGMENTATIONS.NeuroFluxGovernor,
                    // POST DAEDALUS
                    AUGMENTATIONS.TheRedPill
                ].includes(AUGMENTATIONS[a])
                )
            break;
        case 7: //35 / 6000
            filtered_augs = aug_list.filter(a => 
                [
                    //Hacking
                    AUGMENTATIONS.CashRoot,
                    AUGMENTATIONS.Neuralstimulator,
                    AUGMENTATIONS.Neurotrainer1,
                    AUGMENTATIONS.Neurotrainer2,
                    AUGMENTATIONS.CranialSignalProcessorsG1,
                    AUGMENTATIONS.CranialSignalProcessorsG2,
                    AUGMENTATIONS.CranialSignalProcessorsG3,
                    AUGMENTATIONS.CranialSignalProcessorsG4,
                    AUGMENTATIONS.CranialSignalProcessorsG5,
                    AUGMENTATIONS.BitWire,
                    AUGMENTATIONS.SynapticEnhancement,
                    AUGMENTATIONS.ArtificialSynapticPotentiation,
                    AUGMENTATIONS.ENM,
                    AUGMENTATIONS.ENMCore,
                    AUGMENTATIONS.ENMCoreV2,
                    AUGMENTATIONS.NeuralRetentionEnhancement,
                    AUGMENTATIONS.CRTX42AA,
                    AUGMENTATIONS.DataJack,
                    AUGMENTATIONS.EnhancedMyelinSheathing,
                    AUGMENTATIONS.TheBlackHand,
                    AUGMENTATIONS.ArtificialBioNeuralNetwork,
                    AUGMENTATIONS.NeuralAccelerator,
                    AUGMENTATIONS.Neurolink,
                    //Bladerunner
                    AUGMENTATIONS.EsperEyewear,
                    AUGMENTATIONS.EMS4Recombination,
                    AUGMENTATIONS.OrionShoulder,
                    AUGMENTATIONS.HyperionV1,
                    AUGMENTATIONS.HyperionV2, 
                    AUGMENTATIONS.GolemSerum,
                    AUGMENTATIONS.VangelisVirus,
                    AUGMENTATIONS.VangelisVirus3,
                    AUGMENTATIONS.INTERLINKED,
                    AUGMENTATIONS.BladeRunner, 
                    AUGMENTATIONS.BladeArmor,
                    AUGMENTATIONS.BladeArmorEnergyShielding,
                    AUGMENTATIONS.BladeArmorUnibeam,
                    AUGMENTATIONS.BladeArmorIPU,
                    AUGMENTATIONS.BladeArmorPowerCells, 
                    AUGMENTATIONS.BladesSimulacrum,
                    // Combat
                    AUGMENTATIONS.Targeting1,
                    AUGMENTATIONS.Targeting2,
                    AUGMENTATIONS.WiredReflexes, 
                    // Social
                    AUGMENTATIONS.SNA,
                    // Always
                    AUGMENTATIONS.NeuroFluxGovernor,

                    // POST DAEDALUS
                    AUGMENTATIONS.TheRedPill
                ].includes(AUGMENTATIONS[a])
                )
            break;
        case 8: // 30/3000
            filtered_augs = aug_list.filter(a => 
                [
                    // Hacking
                    AUGMENTATIONS.CashRoot,
                    AUGMENTATIONS.Neuralstimulator,
                    AUGMENTATIONS.Neurotrainer1,
                    AUGMENTATIONS.Neurotrainer2,
                    AUGMENTATIONS.CranialSignalProcessorsG1,
                    AUGMENTATIONS.CranialSignalProcessorsG2,
                    AUGMENTATIONS.CranialSignalProcessorsG3,
                    AUGMENTATIONS.CranialSignalProcessorsG4,
                    AUGMENTATIONS.CranialSignalProcessorsG5,
                    AUGMENTATIONS.BitWire, // 10
                    AUGMENTATIONS.SynapticEnhancement,
                    AUGMENTATIONS.ArtificialSynapticPotentiation,
                    AUGMENTATIONS.ENM,
                    AUGMENTATIONS.ENMCore,
                    AUGMENTATIONS.ENMCoreV2,
                    AUGMENTATIONS.NeuralRetentionEnhancement,
                    AUGMENTATIONS.CRTX42AA,
                    AUGMENTATIONS.DataJack,
                    AUGMENTATIONS.EnhancedMyelinSheathing,
                    AUGMENTATIONS.TheBlackHand, // 20
                    AUGMENTATIONS.ArtificialBioNeuralNetwork,
                    AUGMENTATIONS.NeuralAccelerator,
                    AUGMENTATIONS.Neurolink,
                    // Social
                    AUGMENTATIONS.SNA,
                    AUGMENTATIONS.ADRPheromone1, // 25
                    AUGMENTATIONS.Neuregen,
                    // Combat
                    AUGMENTATIONS.Targeting1,
                    AUGMENTATIONS.WiredReflexes,
                    AUGMENTATIONS.SpeechEnhancement,
                    AUGMENTATIONS.HacknetNodeCPUUpload,
                    AUGMENTATIONS.HacknetNodeCacheUpload,
                    AUGMENTATIONS.HacknetNodeCoreDNI,
                    // Always
                    AUGMENTATIONS.NeuroFluxGovernor,
                    // POST DAEDALUS
                    AUGMENTATIONS.ENMCoreV3,
                    AUGMENTATIONS.ENMAnalyzeEngine,
                    AUGMENTATIONS.ENMDMA,
                    AUGMENTATIONS.TheRedPill,
                ].includes(AUGMENTATIONS[a])
                )
            break;
        case 9: // 30 /6000
            filtered_augs = aug_list.filter(a => 
                [
                    // Hacknet
                    AUGMENTATIONS.HacknetNodeCPUUpload,
                    AUGMENTATIONS.HacknetNodeCacheUpload,
                    AUGMENTATIONS.HacknetNodeCoreDNI,
                    AUGMENTATIONS.HacknetNodeKernelDNI, 
                    AUGMENTATIONS.HacknetNodeNICUpload, //5
                    // Hacking
                    AUGMENTATIONS.CashRoot,
                    AUGMENTATIONS.Neuralstimulator,
                    AUGMENTATIONS.Neurotrainer1,
                    AUGMENTATIONS.Neurotrainer2,
                    AUGMENTATIONS.CranialSignalProcessorsG1,
                    AUGMENTATIONS.CranialSignalProcessorsG2,
                    AUGMENTATIONS.CranialSignalProcessorsG3,
                    AUGMENTATIONS.CranialSignalProcessorsG4,
                    AUGMENTATIONS.CranialSignalProcessorsG5,
                    AUGMENTATIONS.BitWire,
                    AUGMENTATIONS.SynapticEnhancement,
                    AUGMENTATIONS.ArtificialSynapticPotentiation,
                    AUGMENTATIONS.ENM,
                    AUGMENTATIONS.ENMCore,
                    AUGMENTATIONS.ENMCoreV2,
                    AUGMENTATIONS.NeuralRetentionEnhancement,
                    AUGMENTATIONS.CRTX42AA,
                    AUGMENTATIONS.DataJack,
                    AUGMENTATIONS.EnhancedMyelinSheathing,
                    AUGMENTATIONS.TheBlackHand,
                    AUGMENTATIONS.ArtificialBioNeuralNetwork,
                    AUGMENTATIONS.NeuralAccelerator,
                    AUGMENTATIONS.Neurolink,
                    // Social
                    AUGMENTATIONS.SNA,
                    AUGMENTATIONS.ADRPheromone1,
                    // Always
                    AUGMENTATIONS.NeuroFluxGovernor,
                    // POST DAEDALUS
                    AUGMENTATIONS.TheRedPill
                ].includes(AUGMENTATIONS[a])
                )
            break;
        case 10: // 30/6000
            filtered_augs = aug_list.filter(a => 
                [
                    // Hacknet                    
                    AUGMENTATIONS.HacknetNodeCPUUpload,
                    AUGMENTATIONS.HacknetNodeCacheUpload,
                    AUGMENTATIONS.HacknetNodeCoreDNI,
                    AUGMENTATIONS.HacknetNodeKernelDNI, 
                    AUGMENTATIONS.HacknetNodeNICUpload, //5
                    // Hacking
                    AUGMENTATIONS.CashRoot,
                    AUGMENTATIONS.Neuralstimulator,
                    AUGMENTATIONS.Neurotrainer1,
                    AUGMENTATIONS.Neurotrainer2,
                    AUGMENTATIONS.CranialSignalProcessorsG1,
                    AUGMENTATIONS.CranialSignalProcessorsG2,
                    AUGMENTATIONS.CranialSignalProcessorsG3,
                    AUGMENTATIONS.CranialSignalProcessorsG4,
                    AUGMENTATIONS.CranialSignalProcessorsG5,
                    AUGMENTATIONS.BitWire,
                    AUGMENTATIONS.SynapticEnhancement,
                    AUGMENTATIONS.ArtificialSynapticPotentiation,
                    AUGMENTATIONS.ENM,
                    AUGMENTATIONS.ENMCore,
                    AUGMENTATIONS.ENMCoreV2,
                    AUGMENTATIONS.NeuralRetentionEnhancement,
                    AUGMENTATIONS.CRTX42AA,
                    AUGMENTATIONS.DataJack,
                    AUGMENTATIONS.EnhancedMyelinSheathing,
                    AUGMENTATIONS.TheBlackHand,
                    AUGMENTATIONS.ArtificialBioNeuralNetwork,
                    AUGMENTATIONS.NeuralAccelerator,
                    AUGMENTATIONS.Neurolink,
                    // Social
                    AUGMENTATIONS.SNA,
                    AUGMENTATIONS.ADRPheromone1,
                    // Always
                    AUGMENTATIONS.NeuroFluxGovernor,
                    // POST DAEDALUS
                    AUGMENTATIONS.TheRedPill
                ].includes(AUGMENTATIONS[a])
                )
            break;
        case 11: // 30/4500
            filtered_augs = aug_list.filter(a => 
                [
                    // Hacking
                    AUGMENTATIONS.CashRoot,
                    AUGMENTATIONS.Neuralstimulator,
                    AUGMENTATIONS.Neurotrainer1,
                    AUGMENTATIONS.Neurotrainer2,
                    AUGMENTATIONS.CranialSignalProcessorsG1,
                    AUGMENTATIONS.CranialSignalProcessorsG2,
                    AUGMENTATIONS.CranialSignalProcessorsG3,
                    AUGMENTATIONS.CranialSignalProcessorsG4,
                    AUGMENTATIONS.CranialSignalProcessorsG5,
                    AUGMENTATIONS.BitWire,
                    AUGMENTATIONS.SynapticEnhancement,
                    AUGMENTATIONS.ArtificialSynapticPotentiation,
                    AUGMENTATIONS.ENM,
                    AUGMENTATIONS.ENMCore,
                    AUGMENTATIONS.ENMCoreV2,
                    AUGMENTATIONS.NeuralRetentionEnhancement,
                    AUGMENTATIONS.CRTX42AA,
                    AUGMENTATIONS.DataJack,
                    AUGMENTATIONS.EnhancedMyelinSheathing,
                    AUGMENTATIONS.TheBlackHand,
                    AUGMENTATIONS.ArtificialBioNeuralNetwork,
                    AUGMENTATIONS.NeuralAccelerator,
                    AUGMENTATIONS.Neurolink,
                    // Social
                    AUGMENTATIONS.SNA,
                    AUGMENTATIONS.ADRPheromone1,
                    // ?
                    // ?
                    // ?
                    // ?
                    // ?
                    // Always
                    AUGMENTATIONS.NeuroFluxGovernor,
                    // POST DAEDALUS
                    AUGMENTATIONS.TheRedPill
                ].includes(AUGMENTATIONS[a])
                )
            break;
        case 12:
            filtered_augs = aug_list
            break;
        default:
            filtered_augs = aug_list
            break;
    }

    let augData = aug_list.map(a => get_object(ns, a))

    ns.clearPort(PORTS.augmentations);
    await ns.writePort(PORTS.augmentations, JSON.stringify(augData));
    await ns.write("/Temp/Augmentations.txt", JSON.stringify(augData), "w");
}
