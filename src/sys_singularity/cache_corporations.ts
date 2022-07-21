import { NS } from "Bitburner";
import { Sing } from "modules/Singularity";
export const main = async (ns: NS) => {
    if (!Sing.has_access(ns)) { return }
}
