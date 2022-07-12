import { NS } from "Bitburner";
import { FactionObject, PlayerObject, ServerObject } from "Phoenix";
import { TermLogger } from "lib/Helpers";
import { PInfo } from "lib/Players";
import { SInfo } from "lib/Servers";
import { FACTIONS, FACTION_MODEL, PORTS, SINGULARITY_FILES } from "lib/Variables";
import { ReservedRam } from "lib/Swap";
import { FactionCache } from "lib/Database";

export const FactionModule = {
    async init(ns: NS) {
        let servers = SInfo.all(ns);
        let player = PInfo.detail(ns);
        const logger = new TermLogger(ns);
        logger.log("Factions Enabled")

        ns.clearPort(PORTS.factions);
    
        let factions = FactionModule.all(ns);
    
        for (const f of factions) {
            await FactionModule.update_cache(ns, f.name, false)
            FactionModule.update_cache(ns, f.name).catch(console.error);
            await ns.asleep(4121);
        }
    },

    async loop(ns: NS) {
        let servers = SInfo.all(ns);
        let player = PInfo.detail(ns);
        let factions = FactionModule.all(ns);
        const logger = new TermLogger(ns);

        let faction_servers = [
            SInfo.detail(ns, "CSEC"), 
            SInfo.detail(ns, "avmnite-02h"), 
            SInfo.detail(ns, "I.I.I.I"), 
            SInfo.detail(ns, "run4theh111z"),
        ]

        for (let s of faction_servers.filter(s => s.admin && !s.backdoored && s.level <= player.hacking.level)) {
            await ReservedRam.use(ns, SINGULARITY_FILES.CONNECT_SERVER, 1, [s.id, true]);
            await ns.asleep(30000);
        }
    },

    all(ns: NS): FactionObject[] {
        return FACTION_MODEL.map(f => FactionModule.detail(ns, f.id))
    },

    detail(ns: NS, faction_name: string): FactionObject {
        let faction_id = FACTIONS[faction_name];
        let faction = {
            id: faction_id,
            name: faction_name,
            join_method: () => {
                switch (faction_id) {
                    case FACTIONS.Aevum:
                        return ReservedRam.use(ns, SINGULARITY_FILES.TRAVEL, 1, ["Aevum"]) // TODO: must be awaited
                    case FACTIONS.BachmanAsociates:
                        break;
                    case FACTIONS.BitRunners:
                        break;
                    case FACTIONS.BladeIndustries:
                        break;
                    case FACTIONS.Chongqing:
                        return ReservedRam.use(ns, SINGULARITY_FILES.TRAVEL, 1, ["Chongqing"])
                    case FACTIONS.ClarkeIncorporated:
                        break;
                    case FACTIONS.CyberSec:
                        break;
                    case FACTIONS.Daedalus:
                        break;
                    case FACTIONS.ECorp:
                        break;
                    case FACTIONS.FourSigma:
                        break;
                    case FACTIONS.FulcrumSecretTechnologies:
                        break;
                    case FACTIONS.Illuminati:
                        break;
                    case FACTIONS.Ishima:
                        return ReservedRam.use(ns, SINGULARITY_FILES.TRAVEL, 1, ["Ishima"])
                    case FACTIONS.KuaiGongInternational:
                        break;
                    case FACTIONS.MegaCorp:
                        break;
                    case FACTIONS.NWO:
                        break;
                    case FACTIONS.Netburners:
                        break;
                    case FACTIONS.NewTokyo:
                        return ReservedRam.use(ns, SINGULARITY_FILES.TRAVEL, 1, ["New Tokyo"])
                    case FACTIONS.NiteSec:
                        break;
                    case FACTIONS.NiteSec:
                        break;
                    case FACTIONS.OmniTekIncorporated:
                        break;
                    case FACTIONS.Sector12:
                        return ReservedRam.use(ns, SINGULARITY_FILES.TRAVEL, 1, ["Sector-12"])
                    case FACTIONS.Silhouette:
                        break;
                    case FACTIONS.SlumSnakes:
                        break;
                    case FACTIONS.SpeakersfortheDead:
                        break;
                    case FACTIONS.Tetrads:
                        break;
                    case FACTIONS.TheBlackHand:
                        break;
                    case FACTIONS.TheCovenant:
                        break;
                    case FACTIONS.TheDarkArmy:
                        break;
                    case FACTIONS.TheSyndicate:
                        break;
                    case FACTIONS.TianDiHui:
                        return ReservedRam.use(ns, SINGULARITY_FILES.TRAVEL, 1, ["Ishima"])
                    case FACTIONS.Volhaven:
                        return ReservedRam.use(ns, SINGULARITY_FILES.TRAVEL, 1, ["Volhaven"])
                    default:
                        break;
                }
                
            }
        }

        return faction
    },

    async update_cache(ns: NS, faction_name: string, repeat = true) {
        do {
            if (repeat) {
                await ns.asleep(1000);
            }
            await FactionCache.update(ns, FactionModule.detail(ns, faction_name));
        } while (repeat)
    },
}

