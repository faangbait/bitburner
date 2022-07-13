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
        return []
    },

    detail(ns: NS, faction_name: string): FactionObject | null {
        return null
    }
}

