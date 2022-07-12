import {NS} from "Bitburner";
import { TermLogger } from "lib/Helpers";
import { FACTIONS, FACTION_MODEL } from "lib/Variables";
import { FactionObject } from "Phoenix";

export const FactionModule = {
    async init(ns: NS) {
        const logger = new TermLogger(ns);
        logger.log("Factions Disabled")
    },

    async loop(ns: NS) {},

    all(ns:NS): FactionObject[] {
        return FACTION_MODEL.map(f => FactionModule.detail(ns, f.id))
    },

    detail(ns: NS, faction_name: string): FactionObject {
        let faction_id = FACTIONS[faction_name];
        let faction = {
            id: faction_id,
            name: faction_name,
            join_method: () => {}
        }
        return faction
    }
}

