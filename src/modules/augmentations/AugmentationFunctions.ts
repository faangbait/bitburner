/**
 * This file uses only Enums and Cache files, which makes it zero-ram. 
 * It can use other functions that are already present on the server, like exec, ServerInfo, and PlayerInfo.
 */

import { NS } from "Bitburner";
import { BitNodeCache } from "modules/bitnodes/BitnodeCache";
import { AugCache } from "modules/augmentations/AugmentationCache";
import { Augmentation, AugmentationNames, Augmentations } from "modules/augmentations/AugmentationEnums";

export const AugmentationFuncs = {
    calculate_costs(ns: NS, augmentations: Augmentation[]) {
        function augsort(ns: NS, sorted: Augmentation[], unsorted: Augmentation[]) {
            let work: Augmentation[] = [];
            let cant: Augmentation[] = [];
        
            let owned_reqs = Array.from(AugCache.all(ns).values()).filter(a => a.owned);
        
            for (const a of unsorted) {
                if (a.prereqs.every(req => owned_reqs.includes(AugmentationNames[req]))) {
                    work.push(a)
                } else {
                    cant.push(a)
                }
            }
            return [...sorted, ...work.sort((a,b) => b.baseCost - a.baseCost), ...cant]
        }
        
        let aug_set = new Set(augmentations);
        augmentations.forEach(a => a.prereqs.forEach(p => aug_set.add(AugmentationNames[p])));
        augmentations = Array.from(aug_set.values());
        
        let sorted: Augmentation[] = [];
        
        while (sorted.length < augmentations.length) {
            sorted = augsort(ns, sorted, augmentations);
        }
        
        let queued_count = 0;
        let bn = BitNodeCache.read(ns, "current");
        
        return sorted.reduce((acc, cur) => {
            let res = cur.baseCost * Math.pow(1.9, queued_count) * bn.multipliers.augmentations.money;
            queued_count++;
            return acc + res
        }, 0)
    },
    
    get_augmentation_path(ns: NS) {
        let aug_map: typeof Augmentations = AugCache.all(ns);
        let filtered_list: Augmentation[] = [];

        
        // const add = (filtered_augs: typeof Augmentations, aug: AugmentationNames): typeof Augmentations => {
        //     let aug_obj = aug_list.get(AugmentationNames[aug]);
        //     if (aug_obj) {
        //         filtered_augs.set(AugmentationNames[aug], aug_obj)
        //     }
        //     return filtered_augs
        // }
        
        // let filt: typeof Augmentations = new Map();
        
        switch (BitNodeCache.read(ns, "current").number) {
            case 1:
                // Hacknet
                filtered_list.push(AugCache.read(ns, AugmentationNames.HacknetNodeCPUUpload));
                filtered_list.push(AugCache.read(ns, AugmentationNames.HacknetNodeCacheUpload));
                filtered_list.push(AugCache.read(ns, AugmentationNames.HacknetNodeCoreDNI));
                filtered_list.push(AugCache.read(ns, AugmentationNames.HacknetNodeKernelDNI));
                filtered_list.push(AugCache.read(ns, AugmentationNames.HacknetNodeNICUpload));
                // Hacking
                filtered_list.push(AugCache.read(ns, AugmentationNames.CashRoot));
                filtered_list.push(AugCache.read(ns, AugmentationNames.Neuralstimulator));
                filtered_list.push(AugCache.read(ns, AugmentationNames.Neurotrainer1));
                filtered_list.push(AugCache.read(ns, AugmentationNames.Neurotrainer2));
                filtered_list.push(AugCache.read(ns, AugmentationNames.CranialSignalProcessorsG1));
                filtered_list.push(AugCache.read(ns, AugmentationNames.CranialSignalProcessorsG2));
                filtered_list.push(AugCache.read(ns, AugmentationNames.CranialSignalProcessorsG3));
                filtered_list.push(AugCache.read(ns, AugmentationNames.CranialSignalProcessorsG4));
                filtered_list.push(AugCache.read(ns, AugmentationNames.CranialSignalProcessorsG5));
                filtered_list.push(AugCache.read(ns, AugmentationNames.BitWire));
                filtered_list.push(AugCache.read(ns, AugmentationNames.SynapticEnhancement));
                filtered_list.push(AugCache.read(ns, AugmentationNames.ArtificialSynapticPotentiation));
                filtered_list.push(AugCache.read(ns, AugmentationNames.ENM));
                filtered_list.push(AugCache.read(ns, AugmentationNames.ENMCore));
                filtered_list.push(AugCache.read(ns, AugmentationNames.ENMCoreV2));
                filtered_list.push(AugCache.read(ns, AugmentationNames.NeuralRetentionEnhancement));
                filtered_list.push(AugCache.read(ns, AugmentationNames.CRTX42AA));
                filtered_list.push(AugCache.read(ns, AugmentationNames.DataJack));
                filtered_list.push(AugCache.read(ns, AugmentationNames.EnhancedMyelinSheathing));
                filtered_list.push(AugCache.read(ns, AugmentationNames.TheBlackHand));
                filtered_list.push(AugCache.read(ns, AugmentationNames.ArtificialBioNeuralNetwork));
                filtered_list.push(AugCache.read(ns, AugmentationNames.NeuralAccelerator));
                filtered_list.push(AugCache.read(ns, AugmentationNames.Neurolink));
                // Social
                filtered_list.push(AugCache.read(ns, AugmentationNames.SNA));
                filtered_list.push(AugCache.read(ns, AugmentationNames.ADRPheromone1));
                filtered_list.push(AugCache.read(ns, AugmentationNames.Neuregen));
                // Post-Daedalus
                filtered_list.push(AugCache.read(ns, AugmentationNames.ENMCoreV3));
                filtered_list.push(AugCache.read(ns, AugmentationNames.ENMAnalyzeEngine));
                filtered_list.push(AugCache.read(ns, AugmentationNames.ENMDMA));
                filtered_list.push(AugCache.read(ns, AugmentationNames.TheRedPill));
                break;
            case 2:
                // Hacknet
                filtered_list.push(AugCache.read(ns, AugmentationNames.HacknetNodeCPUUpload));
                filtered_list.push(AugCache.read(ns, AugmentationNames.HacknetNodeCacheUpload));
                filtered_list.push(AugCache.read(ns, AugmentationNames.HacknetNodeCoreDNI));
                filtered_list.push(AugCache.read(ns, AugmentationNames.HacknetNodeKernelDNI));
                filtered_list.push(AugCache.read(ns, AugmentationNames.HacknetNodeNICUpload));
                // Hacking
                filtered_list.push(AugCache.read(ns, AugmentationNames.CashRoot));
                filtered_list.push(AugCache.read(ns, AugmentationNames.Neuralstimulator));
                filtered_list.push(AugCache.read(ns, AugmentationNames.Neurotrainer1));
                filtered_list.push(AugCache.read(ns, AugmentationNames.Neurotrainer2));
                filtered_list.push(AugCache.read(ns, AugmentationNames.CranialSignalProcessorsG1));
                filtered_list.push(AugCache.read(ns, AugmentationNames.CranialSignalProcessorsG2));
                filtered_list.push(AugCache.read(ns, AugmentationNames.CranialSignalProcessorsG3));
                filtered_list.push(AugCache.read(ns, AugmentationNames.CranialSignalProcessorsG4));
                filtered_list.push(AugCache.read(ns, AugmentationNames.CranialSignalProcessorsG5));
                filtered_list.push(AugCache.read(ns, AugmentationNames.BitWire));
                filtered_list.push(AugCache.read(ns, AugmentationNames.SynapticEnhancement));
                filtered_list.push(AugCache.read(ns, AugmentationNames.ArtificialSynapticPotentiation));
                filtered_list.push(AugCache.read(ns, AugmentationNames.ENM));
                filtered_list.push(AugCache.read(ns, AugmentationNames.ENMCore));
                filtered_list.push(AugCache.read(ns, AugmentationNames.ENMCoreV2));
                filtered_list.push(AugCache.read(ns, AugmentationNames.NeuralRetentionEnhancement));
                filtered_list.push(AugCache.read(ns, AugmentationNames.CRTX42AA));
                filtered_list.push(AugCache.read(ns, AugmentationNames.DataJack));
                filtered_list.push(AugCache.read(ns, AugmentationNames.EnhancedMyelinSheathing));
                filtered_list.push(AugCache.read(ns, AugmentationNames.TheBlackHand));
                filtered_list.push(AugCache.read(ns, AugmentationNames.ArtificialBioNeuralNetwork));
                filtered_list.push(AugCache.read(ns, AugmentationNames.NeuralAccelerator));
                filtered_list.push(AugCache.read(ns, AugmentationNames.Neurolink));
                // Social
                filtered_list.push(AugCache.read(ns, AugmentationNames.SNA));
                filtered_list.push(AugCache.read(ns, AugmentationNames.ADRPheromone1));
                filtered_list.push(AugCache.read(ns, AugmentationNames.Neuregen));
                // Combat
                filtered_list.push(AugCache.read(ns, AugmentationNames.LuminCloaking1));
                filtered_list.push(AugCache.read(ns, AugmentationNames.LuminCloaking2));
                filtered_list.push(AugCache.read(ns, AugmentationNames.SmartSonar));
                filtered_list.push(AugCache.read(ns, AugmentationNames.PCMatrix,));
                filtered_list.push(AugCache.read(ns, AugmentationNames.INFRARet));
                filtered_list.push(AugCache.read(ns, AugmentationNames.Targeting1));
                filtered_list.push(AugCache.read(ns, AugmentationNames.Targeting2));
                filtered_list.push(AugCache.read(ns, AugmentationNames.CombatRib1));
                filtered_list.push(AugCache.read(ns, AugmentationNames.NanofiberWeave));
                filtered_list.push(AugCache.read(ns, AugmentationNames.NutriGen));
                // Post Daedalus
                filtered_list.push(AugCache.read(ns, AugmentationNames.GrapheneBrachiBlades));
                filtered_list.push(AugCache.read(ns, AugmentationNames.BrachiBlades));
                filtered_list.push(AugCache.read(ns, AugmentationNames.HemoRecirculator));
                filtered_list.push(AugCache.read(ns, AugmentationNames.TheRedPill));
                break;
            case 3:
                // Hacknet
                filtered_list.push(AugCache.read(ns, AugmentationNames.HacknetNodeCPUUpload));
                filtered_list.push(AugCache.read(ns, AugmentationNames.HacknetNodeCacheUpload));
                filtered_list.push(AugCache.read(ns, AugmentationNames.HacknetNodeCoreDNI));
                filtered_list.push(AugCache.read(ns, AugmentationNames.HacknetNodeKernelDNI));
                filtered_list.push(AugCache.read(ns, AugmentationNames.HacknetNodeNICUpload));
                // Hacking
                filtered_list.push(AugCache.read(ns, AugmentationNames.CashRoot));
                filtered_list.push(AugCache.read(ns, AugmentationNames.Neuralstimulator));
                filtered_list.push(AugCache.read(ns, AugmentationNames.Neurotrainer1));
                filtered_list.push(AugCache.read(ns, AugmentationNames.Neurotrainer2));
                filtered_list.push(AugCache.read(ns, AugmentationNames.CranialSignalProcessorsG1));
                filtered_list.push(AugCache.read(ns, AugmentationNames.CranialSignalProcessorsG2));
                filtered_list.push(AugCache.read(ns, AugmentationNames.CranialSignalProcessorsG3));
                filtered_list.push(AugCache.read(ns, AugmentationNames.CranialSignalProcessorsG4));
                filtered_list.push(AugCache.read(ns, AugmentationNames.CranialSignalProcessorsG5));
                filtered_list.push(AugCache.read(ns, AugmentationNames.BitWire));
                filtered_list.push(AugCache.read(ns, AugmentationNames.SynapticEnhancement));
                filtered_list.push(AugCache.read(ns, AugmentationNames.ArtificialSynapticPotentiation));
                filtered_list.push(AugCache.read(ns, AugmentationNames.ENM));
                filtered_list.push(AugCache.read(ns, AugmentationNames.ENMCore));
                filtered_list.push(AugCache.read(ns, AugmentationNames.ENMCoreV2));
                filtered_list.push(AugCache.read(ns, AugmentationNames.NeuralRetentionEnhancement));
                filtered_list.push(AugCache.read(ns, AugmentationNames.CRTX42AA));
                filtered_list.push(AugCache.read(ns, AugmentationNames.DataJack));
                filtered_list.push(AugCache.read(ns, AugmentationNames.EnhancedMyelinSheathing));
                filtered_list.push(AugCache.read(ns, AugmentationNames.TheBlackHand));
                filtered_list.push(AugCache.read(ns, AugmentationNames.ArtificialBioNeuralNetwork));
                filtered_list.push(AugCache.read(ns, AugmentationNames.NeuralAccelerator));
                filtered_list.push(AugCache.read(ns, AugmentationNames.Neurolink));
                // Social
                filtered_list.push(AugCache.read(ns, AugmentationNames.SNA));
                filtered_list.push(AugCache.read(ns, AugmentationNames.ADRPheromone1));
                // Post Daedalus
                filtered_list.push(AugCache.read(ns, AugmentationNames.TheRedPill));
                break;
            case 4:
                // Hacking
                filtered_list.push(AugCache.read(ns, AugmentationNames.CashRoot));
                filtered_list.push(AugCache.read(ns, AugmentationNames.Neuralstimulator));
                filtered_list.push(AugCache.read(ns, AugmentationNames.Neurotrainer1));
                filtered_list.push(AugCache.read(ns, AugmentationNames.Neurotrainer2));
                filtered_list.push(AugCache.read(ns, AugmentationNames.CranialSignalProcessorsG1));
                filtered_list.push(AugCache.read(ns, AugmentationNames.CranialSignalProcessorsG2));
                filtered_list.push(AugCache.read(ns, AugmentationNames.CranialSignalProcessorsG3));
                filtered_list.push(AugCache.read(ns, AugmentationNames.CranialSignalProcessorsG4));
                filtered_list.push(AugCache.read(ns, AugmentationNames.CranialSignalProcessorsG5));
                filtered_list.push(AugCache.read(ns, AugmentationNames.BitWire));
                filtered_list.push(AugCache.read(ns, AugmentationNames.SynapticEnhancement));
                filtered_list.push(AugCache.read(ns, AugmentationNames.ArtificialSynapticPotentiation));
                filtered_list.push(AugCache.read(ns, AugmentationNames.ENM));
                filtered_list.push(AugCache.read(ns, AugmentationNames.ENMCore));
                filtered_list.push(AugCache.read(ns, AugmentationNames.ENMCoreV2));
                filtered_list.push(AugCache.read(ns, AugmentationNames.NeuralRetentionEnhancement));
                filtered_list.push(AugCache.read(ns, AugmentationNames.CRTX42AA));
                filtered_list.push(AugCache.read(ns, AugmentationNames.DataJack));
                filtered_list.push(AugCache.read(ns, AugmentationNames.EnhancedMyelinSheathing));
                filtered_list.push(AugCache.read(ns, AugmentationNames.TheBlackHand));
                filtered_list.push(AugCache.read(ns, AugmentationNames.ArtificialBioNeuralNetwork));
                filtered_list.push(AugCache.read(ns, AugmentationNames.NeuralAccelerator));
                filtered_list.push(AugCache.read(ns, AugmentationNames.Neurolink));
                // ?
                // ?
                // ?
                // ?
                // ?
                // Post Daedalus
                filtered_list.push(AugCache.read(ns, AugmentationNames.TheRedPill));
                break;
            case 5:
                // Hacknet
                filtered_list.push(AugCache.read(ns, AugmentationNames.HacknetNodeCPUUpload));
                filtered_list.push(AugCache.read(ns, AugmentationNames.HacknetNodeCacheUpload));
                filtered_list.push(AugCache.read(ns, AugmentationNames.HacknetNodeCoreDNI));
                filtered_list.push(AugCache.read(ns, AugmentationNames.HacknetNodeKernelDNI));
                filtered_list.push(AugCache.read(ns, AugmentationNames.HacknetNodeNICUpload));
                // Hacking
                filtered_list.push(AugCache.read(ns, AugmentationNames.CashRoot));
                filtered_list.push(AugCache.read(ns, AugmentationNames.Neuralstimulator));
                filtered_list.push(AugCache.read(ns, AugmentationNames.Neurotrainer1));
                filtered_list.push(AugCache.read(ns, AugmentationNames.Neurotrainer2));
                filtered_list.push(AugCache.read(ns, AugmentationNames.CranialSignalProcessorsG1));
                filtered_list.push(AugCache.read(ns, AugmentationNames.CranialSignalProcessorsG2));
                filtered_list.push(AugCache.read(ns, AugmentationNames.CranialSignalProcessorsG3));
                filtered_list.push(AugCache.read(ns, AugmentationNames.CranialSignalProcessorsG4));
                filtered_list.push(AugCache.read(ns, AugmentationNames.CranialSignalProcessorsG5));
                filtered_list.push(AugCache.read(ns, AugmentationNames.BitWire));
                filtered_list.push(AugCache.read(ns, AugmentationNames.SynapticEnhancement));
                filtered_list.push(AugCache.read(ns, AugmentationNames.ArtificialSynapticPotentiation));
                filtered_list.push(AugCache.read(ns, AugmentationNames.ENM));
                filtered_list.push(AugCache.read(ns, AugmentationNames.ENMCore));
                filtered_list.push(AugCache.read(ns, AugmentationNames.ENMCoreV2));
                filtered_list.push(AugCache.read(ns, AugmentationNames.NeuralRetentionEnhancement));
                filtered_list.push(AugCache.read(ns, AugmentationNames.CRTX42AA));
                filtered_list.push(AugCache.read(ns, AugmentationNames.DataJack));
                filtered_list.push(AugCache.read(ns, AugmentationNames.EnhancedMyelinSheathing));
                filtered_list.push(AugCache.read(ns, AugmentationNames.TheBlackHand));
                filtered_list.push(AugCache.read(ns, AugmentationNames.ArtificialBioNeuralNetwork));
                filtered_list.push(AugCache.read(ns, AugmentationNames.NeuralAccelerator));
                filtered_list.push(AugCache.read(ns, AugmentationNames.Neurolink));
                // Social
                filtered_list.push(AugCache.read(ns, AugmentationNames.SNA));
                filtered_list.push(AugCache.read(ns, AugmentationNames.ADRPheromone1));
                // Post Daedalus
                filtered_list.push(AugCache.read(ns, AugmentationNames.TheRedPill));
                break;
            default:
                ns.tprint("Lost BitNode cache, can't determine current bitnode")
                break;
        }

        return filtered_list
    }
}

// case 6: //35 / 6000
//             filtered_augs = aug_list.filter(a => 
//                 [
//                     // Hacking
//                     AUGMENTATIONS.CashRoot,
//                     AUGMENTATIONS.Neuralstimulator,
//                     AUGMENTATIONS.Neurotrainer1,
//                     AUGMENTATIONS.Neurotrainer2,
//                     AUGMENTATIONS.CranialSignalProcessorsG1,
//                     AUGMENTATIONS.CranialSignalProcessorsG2,
//                     AUGMENTATIONS.CranialSignalProcessorsG3,
//                     AUGMENTATIONS.CranialSignalProcessorsG4,
//                     AUGMENTATIONS.CranialSignalProcessorsG5,
//                     AUGMENTATIONS.BitWire,
//                     AUGMENTATIONS.SynapticEnhancement,
//                     AUGMENTATIONS.ArtificialSynapticPotentiation,
//                     AUGMENTATIONS.ENM,
//                     AUGMENTATIONS.ENMCore,
//                     AUGMENTATIONS.ENMCoreV2,
//                     AUGMENTATIONS.NeuralRetentionEnhancement,
//                     AUGMENTATIONS.CRTX42AA,
//                     AUGMENTATIONS.DataJack,
//                     AUGMENTATIONS.EnhancedMyelinSheathing,
//                     AUGMENTATIONS.TheBlackHand,
//                     AUGMENTATIONS.ArtificialBioNeuralNetwork,
//                     AUGMENTATIONS.NeuralAccelerator,
//                     AUGMENTATIONS.Neurolink,
//                     // Bladerunner
//                     AUGMENTATIONS.EsperEyewear,
//                     AUGMENTATIONS.EMS4Recombination,
//                     AUGMENTATIONS.OrionShoulder,
//                     AUGMENTATIONS.HyperionV1,
//                     AUGMENTATIONS.HyperionV2,
//                     AUGMENTATIONS.GolemSerum,
//                     AUGMENTATIONS.VangelisVirus,
//                     AUGMENTATIONS.VangelisVirus3,
//                     AUGMENTATIONS.INTERLINKED,
//                     AUGMENTATIONS.BladeRunner,
//                     AUGMENTATIONS.BladeArmor,
//                     AUGMENTATIONS.BladeArmorEnergyShielding,
//                     AUGMENTATIONS.BladeArmorUnibeam,
//                     AUGMENTATIONS.BladeArmorIPU,
//                     AUGMENTATIONS.BladeArmorPowerCells,
//                     AUGMENTATIONS.BladesSimulacrum,
//                     //Combat
//                     AUGMENTATIONS.Targeting1,
//                     AUGMENTATIONS.Targeting2,
//                     AUGMENTATIONS.WiredReflexes,
//                     // Socila
//                     AUGMENTATIONS.SNA,
//                     // Always
//                     AUGMENTATIONS.NeuroFluxGovernor,
//                     // POST DAEDALUS
//                     AUGMENTATIONS.TheRedPill
//                 ].includes(AUGMENTATIONS[a])
//                 )
//             break;
//         case 7: //35 / 6000
//             filtered_augs = aug_list.filter(a => 
//                 [
//                     //Hacking
//                     AUGMENTATIONS.CashRoot,
//                     AUGMENTATIONS.Neuralstimulator,
//                     AUGMENTATIONS.Neurotrainer1,
//                     AUGMENTATIONS.Neurotrainer2,
//                     AUGMENTATIONS.CranialSignalProcessorsG1,
//                     AUGMENTATIONS.CranialSignalProcessorsG2,
//                     AUGMENTATIONS.CranialSignalProcessorsG3,
//                     AUGMENTATIONS.CranialSignalProcessorsG4,
//                     AUGMENTATIONS.CranialSignalProcessorsG5,
//                     AUGMENTATIONS.BitWire,
//                     AUGMENTATIONS.SynapticEnhancement,
//                     AUGMENTATIONS.ArtificialSynapticPotentiation,
//                     AUGMENTATIONS.ENM,
//                     AUGMENTATIONS.ENMCore,
//                     AUGMENTATIONS.ENMCoreV2,
//                     AUGMENTATIONS.NeuralRetentionEnhancement,
//                     AUGMENTATIONS.CRTX42AA,
//                     AUGMENTATIONS.DataJack,
//                     AUGMENTATIONS.EnhancedMyelinSheathing,
//                     AUGMENTATIONS.TheBlackHand,
//                     AUGMENTATIONS.ArtificialBioNeuralNetwork,
//                     AUGMENTATIONS.NeuralAccelerator,
//                     AUGMENTATIONS.Neurolink,
//                     //Bladerunner
//                     AUGMENTATIONS.EsperEyewear,
//                     AUGMENTATIONS.EMS4Recombination,
//                     AUGMENTATIONS.OrionShoulder,
//                     AUGMENTATIONS.HyperionV1,
//                     AUGMENTATIONS.HyperionV2, 
//                     AUGMENTATIONS.GolemSerum,
//                     AUGMENTATIONS.VangelisVirus,
//                     AUGMENTATIONS.VangelisVirus3,
//                     AUGMENTATIONS.INTERLINKED,
//                     AUGMENTATIONS.BladeRunner, 
//                     AUGMENTATIONS.BladeArmor,
//                     AUGMENTATIONS.BladeArmorEnergyShielding,
//                     AUGMENTATIONS.BladeArmorUnibeam,
//                     AUGMENTATIONS.BladeArmorIPU,
//                     AUGMENTATIONS.BladeArmorPowerCells, 
//                     AUGMENTATIONS.BladesSimulacrum,
//                     // Combat
//                     AUGMENTATIONS.Targeting1,
//                     AUGMENTATIONS.Targeting2,
//                     AUGMENTATIONS.WiredReflexes, 
//                     // Social
//                     AUGMENTATIONS.SNA,
//                     // Always
//                     AUGMENTATIONS.NeuroFluxGovernor,

//                     // POST DAEDALUS
//                     AUGMENTATIONS.TheRedPill
//                 ].includes(AUGMENTATIONS[a])
//                 )
//             break;
//         case 8: // 30/3000
//             filtered_augs = aug_list.filter(a => 
//                 [
//                     // Hacking
//                     AUGMENTATIONS.CashRoot,
//                     AUGMENTATIONS.Neuralstimulator,
//                     AUGMENTATIONS.Neurotrainer1,
//                     AUGMENTATIONS.Neurotrainer2,
//                     AUGMENTATIONS.CranialSignalProcessorsG1,
//                     AUGMENTATIONS.CranialSignalProcessorsG2,
//                     AUGMENTATIONS.CranialSignalProcessorsG3,
//                     AUGMENTATIONS.CranialSignalProcessorsG4,
//                     AUGMENTATIONS.CranialSignalProcessorsG5,
//                     AUGMENTATIONS.BitWire, // 10
//                     AUGMENTATIONS.SynapticEnhancement,
//                     AUGMENTATIONS.ArtificialSynapticPotentiation,
//                     AUGMENTATIONS.ENM,
//                     AUGMENTATIONS.ENMCore,
//                     AUGMENTATIONS.ENMCoreV2,
//                     AUGMENTATIONS.NeuralRetentionEnhancement,
//                     AUGMENTATIONS.CRTX42AA,
//                     AUGMENTATIONS.DataJack,
//                     AUGMENTATIONS.EnhancedMyelinSheathing,
//                     AUGMENTATIONS.TheBlackHand, // 20
//                     AUGMENTATIONS.ArtificialBioNeuralNetwork,
//                     AUGMENTATIONS.NeuralAccelerator,
//                     AUGMENTATIONS.Neurolink,
//                     // Social
//                     AUGMENTATIONS.SNA,
//                     AUGMENTATIONS.ADRPheromone1, // 25
//                     AUGMENTATIONS.Neuregen,
//                     // Combat
//                     AUGMENTATIONS.Targeting1,
//                     AUGMENTATIONS.WiredReflexes,
//                     AUGMENTATIONS.SpeechEnhancement,
//                     AUGMENTATIONS.HacknetNodeCPUUpload,
//                     AUGMENTATIONS.HacknetNodeCacheUpload,
//                     AUGMENTATIONS.HacknetNodeCoreDNI,
//                     // Always
//                     AUGMENTATIONS.NeuroFluxGovernor,
//                     // POST DAEDALUS
//                     AUGMENTATIONS.ENMCoreV3,
//                     AUGMENTATIONS.ENMAnalyzeEngine,
//                     AUGMENTATIONS.ENMDMA,
//                     AUGMENTATIONS.TheRedPill,
//                 ].includes(AUGMENTATIONS[a])
//                 )
//             break;
//         case 9: // 30 /6000
//             filtered_augs = aug_list.filter(a => 
//                 [
//                     // Hacknet
//                     AUGMENTATIONS.HacknetNodeCPUUpload,
//                     AUGMENTATIONS.HacknetNodeCacheUpload,
//                     AUGMENTATIONS.HacknetNodeCoreDNI,
//                     AUGMENTATIONS.HacknetNodeKernelDNI, 
//                     AUGMENTATIONS.HacknetNodeNICUpload, //5
//                     // Hacking
//                     AUGMENTATIONS.CashRoot,
//                     AUGMENTATIONS.Neuralstimulator,
//                     AUGMENTATIONS.Neurotrainer1,
//                     AUGMENTATIONS.Neurotrainer2,
//                     AUGMENTATIONS.CranialSignalProcessorsG1,
//                     AUGMENTATIONS.CranialSignalProcessorsG2,
//                     AUGMENTATIONS.CranialSignalProcessorsG3,
//                     AUGMENTATIONS.CranialSignalProcessorsG4,
//                     AUGMENTATIONS.CranialSignalProcessorsG5,
//                     AUGMENTATIONS.BitWire,
//                     AUGMENTATIONS.SynapticEnhancement,
//                     AUGMENTATIONS.ArtificialSynapticPotentiation,
//                     AUGMENTATIONS.ENM,
//                     AUGMENTATIONS.ENMCore,
//                     AUGMENTATIONS.ENMCoreV2,
//                     AUGMENTATIONS.NeuralRetentionEnhancement,
//                     AUGMENTATIONS.CRTX42AA,
//                     AUGMENTATIONS.DataJack,
//                     AUGMENTATIONS.EnhancedMyelinSheathing,
//                     AUGMENTATIONS.TheBlackHand,
//                     AUGMENTATIONS.ArtificialBioNeuralNetwork,
//                     AUGMENTATIONS.NeuralAccelerator,
//                     AUGMENTATIONS.Neurolink,
//                     // Social
//                     AUGMENTATIONS.SNA,
//                     AUGMENTATIONS.ADRPheromone1,
//                     // Always
//                     AUGMENTATIONS.NeuroFluxGovernor,
//                     // POST DAEDALUS
//                     AUGMENTATIONS.TheRedPill
//                 ].includes(AUGMENTATIONS[a])
//                 )
//             break;
//         case 10: // 30/6000
//             filtered_augs = aug_list.filter(a => 
//                 [
//                     // Hacknet                    
//                     AUGMENTATIONS.HacknetNodeCPUUpload,
//                     AUGMENTATIONS.HacknetNodeCacheUpload,
//                     AUGMENTATIONS.HacknetNodeCoreDNI,
//                     AUGMENTATIONS.HacknetNodeKernelDNI, 
//                     AUGMENTATIONS.HacknetNodeNICUpload, //5
//                     // Hacking
//                     AUGMENTATIONS.CashRoot,
//                     AUGMENTATIONS.Neuralstimulator,
//                     AUGMENTATIONS.Neurotrainer1,
//                     AUGMENTATIONS.Neurotrainer2,
//                     AUGMENTATIONS.CranialSignalProcessorsG1,
//                     AUGMENTATIONS.CranialSignalProcessorsG2,
//                     AUGMENTATIONS.CranialSignalProcessorsG3,
//                     AUGMENTATIONS.CranialSignalProcessorsG4,
//                     AUGMENTATIONS.CranialSignalProcessorsG5,
//                     AUGMENTATIONS.BitWire,
//                     AUGMENTATIONS.SynapticEnhancement,
//                     AUGMENTATIONS.ArtificialSynapticPotentiation,
//                     AUGMENTATIONS.ENM,
//                     AUGMENTATIONS.ENMCore,
//                     AUGMENTATIONS.ENMCoreV2,
//                     AUGMENTATIONS.NeuralRetentionEnhancement,
//                     AUGMENTATIONS.CRTX42AA,
//                     AUGMENTATIONS.DataJack,
//                     AUGMENTATIONS.EnhancedMyelinSheathing,
//                     AUGMENTATIONS.TheBlackHand,
//                     AUGMENTATIONS.ArtificialBioNeuralNetwork,
//                     AUGMENTATIONS.NeuralAccelerator,
//                     AUGMENTATIONS.Neurolink,
//                     // Social
//                     AUGMENTATIONS.SNA,
//                     AUGMENTATIONS.ADRPheromone1,
//                     // Always
//                     AUGMENTATIONS.NeuroFluxGovernor,
//                     // POST DAEDALUS
//                     AUGMENTATIONS.TheRedPill
//                 ].includes(AUGMENTATIONS[a])
//                 )
//             break;
//         case 11: // 30/4500
//             filtered_augs = aug_list.filter(a => 
//                 [
//                     // Hacking
//                     AUGMENTATIONS.CashRoot,
//                     AUGMENTATIONS.Neuralstimulator,
//                     AUGMENTATIONS.Neurotrainer1,
//                     AUGMENTATIONS.Neurotrainer2,
//                     AUGMENTATIONS.CranialSignalProcessorsG1,
//                     AUGMENTATIONS.CranialSignalProcessorsG2,
//                     AUGMENTATIONS.CranialSignalProcessorsG3,
//                     AUGMENTATIONS.CranialSignalProcessorsG4,
//                     AUGMENTATIONS.CranialSignalProcessorsG5,
//                     AUGMENTATIONS.BitWire,
//                     AUGMENTATIONS.SynapticEnhancement,
//                     AUGMENTATIONS.ArtificialSynapticPotentiation,
//                     AUGMENTATIONS.ENM,
//                     AUGMENTATIONS.ENMCore,
//                     AUGMENTATIONS.ENMCoreV2,
//                     AUGMENTATIONS.NeuralRetentionEnhancement,
//                     AUGMENTATIONS.CRTX42AA,
//                     AUGMENTATIONS.DataJack,
//                     AUGMENTATIONS.EnhancedMyelinSheathing,
//                     AUGMENTATIONS.TheBlackHand,
//                     AUGMENTATIONS.ArtificialBioNeuralNetwork,
//                     AUGMENTATIONS.NeuralAccelerator,
//                     AUGMENTATIONS.Neurolink,
//                     // Social
//                     AUGMENTATIONS.SNA,
//                     AUGMENTATIONS.ADRPheromone1,
//                     // ?
//                     // ?
//                     // ?
//                     // ?
//                     // ?
//                     // Always
//                     AUGMENTATIONS.NeuroFluxGovernor,
//                     // POST DAEDALUS
//                     AUGMENTATIONS.TheRedPill
//                 ].includes(AUGMENTATIONS[a])
//                 )
//             break;
