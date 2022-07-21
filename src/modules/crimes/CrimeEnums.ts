import { CrimeStats } from "Bitburner";

export enum CrimeNames {
    Shoplift = "shoplift",
    RobStore = "rob store",
    MugSomeone = "mug someone",
    Larceny = "larceny",
    DealDrugs = "deal drugs",
    BondForgery = "bond forgery",
    Traffick = "traffick illegal arms",
    Homicide = "homicide",
    GrandTheftAuto = "grand theft auto",
    Kidnap = "kidnap and ransom",
    Assassinate = "assassinate",
    Heist = "heist"
}

export interface Crime {
    id: string;
    chance: number;
    stats: CrimeStats;
}

export const Crimes: Map<string, Crime> = new Map();
