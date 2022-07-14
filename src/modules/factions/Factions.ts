/**
 * Note: File meant to be used by loader apps, not the main script
 */
import { NS } from "Bitburner";
import { CITIES } from "modules/cities/CityEnums";
import { Factions, FACTIONS } from "modules/factions/FactionEnums";

class Faction {
    id: string;
    name = "";
    hostname = "";
    ticker = "";
    invited = false;
    augmentations: string[] = [];
    rep = 0;
    favor = 0;
    blocked = false;
    member = false;
    enemies: string[] = [];
    offers_field = false;
    offers_hacking = false;
    offers_security = false;
    keep_on_reset = false;
    city: string | null = null;
    aug_req = 0;
    cash_req = 0;
    hack_req = 0;
    combat_req = 0;
    karma_req = 0;
    reputation_req = 0;
    backdoor_req: string | null = null;
    hnet_req: {level: number, ram: number, core: number} = { level: 0, ram: 0, core: 0 }
    other_req: () => boolean = () => true

    constructor(ns: NS, name: string) {
        this.id = Factions[name];
        this.name = name;
        this.augmentations = ns.singularity.getAugmentationsFromFaction(name);

        switch (this.name) {
            case FACTIONS[FACTIONS.Illuminati] ||
            FACTIONS[FACTIONS.Daedalus] || 
            FACTIONS[FACTIONS.TheCovenant]:
                this.offers_hacking = true;
                this.offers_field = true;
                break;
            case FACTIONS[FACTIONS.ECorp] ||
            FACTIONS[FACTIONS.MegaCorp] ||
            FACTIONS[FACTIONS.BachmanAssociates] ||
            FACTIONS[FACTIONS.BladeIndustries] ||
            FACTIONS[FACTIONS.NWO] ||
            FACTIONS[FACTIONS.ClarkeIncorporated] ||
            FACTIONS[FACTIONS.OmniTekIncorporated] ||
            FACTIONS[FACTIONS.FourSigma] ||
            FACTIONS[FACTIONS.KuaiGongInternational]:
                this.offers_hacking = true;
                this.offers_field = true;
                this.offers_security = true;
                this.keep_on_reset = true;
                this.reputation_req = 2e5;
                break;
            case FACTIONS[FACTIONS.FulcrumSecretTechnologies]:
                this.offers_field = true;
                this.offers_hacking = true;
                this.keep_on_reset = true;
                this.backdoor_req = "fulcrumassets"
                this.reputation_req = 2.5e5;
                break;
            case FACTIONS[FACTIONS.BitRunners]:
                this.offers_hacking = true;
                break;
            case FACTIONS[FACTIONS.TheBlackHand]:
                this.offers_field = true;
                this.offers_hacking = true;
                break;
            case FACTIONS[FACTIONS.NiteSec] ||
            FACTIONS[FACTIONS.CyberSec]:
                this.offers_hacking = true;
                break;
            case FACTIONS[FACTIONS.Aevum] ||
            FACTIONS[FACTIONS.Chongqing] ||
            FACTIONS[FACTIONS.Ishima] ||
            FACTIONS[FACTIONS.NewTokyo] ||
            FACTIONS[FACTIONS.Sector12] ||
            FACTIONS[FACTIONS.Volhaven]:
                this.offers_field = true;
                this.offers_hacking = true;
                this.offers_security = true;
                break;
            case FACTIONS[FACTIONS.SpeakersForTheDead]:
                this.offers_field = true;
                this.offers_hacking = true;
                this.offers_security = true;
                this.hack_req = 100;
                this.combat_req = 300;
                this.karma_req = -45;
                this.other_req = () => { return true } // TODO
                break;
            case FACTIONS[FACTIONS.TheDarkArmy]:
                this.offers_field = true;
                this.offers_hacking = true;
                this.hack_req = 300;
                this.combat_req = 300;
                this.karma_req = -45;
                break;
            case FACTIONS[FACTIONS.TheSyndicate]:
                this.offers_field = true;
                this.offers_hacking = true;
                this.offers_security = true;
                this.hack_req = 200;
                this.combat_req = 200;
                this.cash_req = 1e8;
                this.karma_req = -90;
                break;
            case FACTIONS[FACTIONS.Silhouette]:
                this.offers_field = true;
                this.offers_hacking = true;
                this.cash_req = 1.5e7;
                this.karma_req = -22;
                this.other_req = () => { return true } // TODO
                break;
            case FACTIONS[FACTIONS.Tetrads]:
                this.offers_field = true;
                this.offers_security = true;
                this.combat_req = 75;
                this.karma_req = -18;
                break;
            case FACTIONS[FACTIONS.SlumSnakes]:
                this.offers_field = true;
                this.offers_security = true;
                this.combat_req = 30;
                this.karma_req = -9;
                this.cash_req = 1e6
                break;
            case FACTIONS[FACTIONS.Netburners]:
                this.offers_hacking = true;
                break;
            case FACTIONS[FACTIONS.TianDiHui]:
                this.offers_hacking = true;
                this.offers_security = true;
                break;
            case FACTIONS[FACTIONS.Bladeburners]:
                break;
                case FACTIONS[FACTIONS.ChurchOfTheMachineGod]:
                this.keep_on_reset = true;
                this.other_req = () => true
                break;
            case FACTIONS[FACTIONS.ShadowsOfAnarchy]:
                this.keep_on_reset = true;
                this.other_req = () => true
                break;
            case FACTIONS[FACTIONS.TheCovenant]:
                this.aug_req = 20;
                this.cash_req = 7.5e10;
                this.hack_req = 850;
                this.combat_req = 850;
                break;
            case FACTIONS[FACTIONS.Daedalus]:
                this.aug_req = 30;
                this.cash_req = 100;
                this.hack_req = 2500;
                break;
            case FACTIONS[FACTIONS.Illuminati]:
                this.aug_req = 30;
                this.cash_req = 1.5e10;
                this.hack_req = 1500;
                this.combat_req = 1200;
                break;
            default:
                break;
        }

        switch (this.name) {
            case FACTIONS[FACTIONS.CyberSec]:
                this.backdoor_req = "CSEC";
                break;
            case FACTIONS[FACTIONS.NiteSec]:
                this.backdoor_req = "avmnite-02h"
                break;
            case FACTIONS[FACTIONS.TheBlackHand]:
                this.backdoor_req = "I.I.I.I";
                break;
            case FACTIONS[FACTIONS.BitRunners]:
                this.backdoor_req = "run4theh111z"
                break;
            case FACTIONS[FACTIONS.Aevum]:
                this.enemies = [
                    FACTIONS[FACTIONS.Chongqing], 
                    FACTIONS[FACTIONS.Ishima], 
                    FACTIONS[FACTIONS.NewTokyo], 
                    FACTIONS[FACTIONS.Volhaven], 
                ];
                this.city = CITIES[CITIES.Aevum];
                this.cash_req = 4e7
                break;
            case FACTIONS[FACTIONS.Chongqing]:
                this.enemies = [
                    FACTIONS[FACTIONS.Sector12], 
                    FACTIONS[FACTIONS.Aevum], 
                    FACTIONS[FACTIONS.Volhaven], 
                ];
                this.city = CITIES[CITIES.Chongqing];
                this.cash_req = 2e7
                break;
            case FACTIONS[FACTIONS.Ishima]:
                this.enemies = [
                    FACTIONS[FACTIONS.Sector12], 
                    FACTIONS[FACTIONS.Aevum], 
                    FACTIONS[FACTIONS.Volhaven], 
                ];
                this.city = CITIES[CITIES.Ishima];
                this.cash_req = 3e7;
                break;
            case FACTIONS[FACTIONS.NewTokyo]:
                this.enemies = [
                    FACTIONS[FACTIONS.Sector12], 
                    FACTIONS[FACTIONS.Aevum], 
                    FACTIONS[FACTIONS.Volhaven], 
                ];
                this.city = CITIES[CITIES.NewTokyo];
                this.cash_req = 2e7;
                break;
            case FACTIONS[FACTIONS.Sector12]:
                this.enemies = [
                    FACTIONS[FACTIONS.Chongqing], 
                    FACTIONS[FACTIONS.Ishima], 
                    FACTIONS[FACTIONS.NewTokyo], 
                    FACTIONS[FACTIONS.Volhaven], 
                ];
                
                this.city = CITIES[CITIES.Sector12];
                this.cash_req = 1.5e7;
                break;
            case FACTIONS[FACTIONS.Volhaven]:
                this.enemies = [
                    FACTIONS[FACTIONS.Sector12], 
                    FACTIONS[FACTIONS.Aevum], 
                    FACTIONS[FACTIONS.Chongqing], 
                    FACTIONS[FACTIONS.Ishima], 
                    FACTIONS[FACTIONS.NewTokyo], 
                ];
                this.city = CITIES[CITIES.Volhaven];
                this.cash_req = 5e7;
                break;
            case FACTIONS[FACTIONS.TianDiHui]:
                this.city = CITIES[CITIES.Chongqing];
                this.cash_req = 1e7;
                this.hack_req = 50;
                break;
            case FACTIONS[FACTIONS.Netburners]:
                this.hnet_req = { level: 100, ram: 8, core: 4}
                break;
            case FACTIONS[FACTIONS.Tetrads]:
                this.city = CITIES[CITIES.Chongqing];
                break;
            case FACTIONS[FACTIONS.TheDarkArmy]:
                this.city = CITIES[CITIES.Chongqing];
                break;
            case FACTIONS[FACTIONS.TheSyndicate]:
                this.city = CITIES[CITIES.Sector12];
                break;
            default:
                break;
        }
    }
}

/**
 * Returns a list of Faction objects
 */
export const get_factions = (ns: NS) => {
    for (const fname in FACTIONS) {
        Factions[fname] = new Faction(ns, fname)
    }
    return Factions;
}
