import { NS } from "Bitburner";
import { CrimeCache } from "modules/crimes/CrimeCache";
import { CrimeInfo } from "modules/crimes/Crimes";
import { Sing } from "modules/Singularity";

export const main = async (ns: NS) => {
    if (!Sing.has_access(ns)) { return }
    const crimes = CrimeInfo.all(ns);
    for (const crime of crimes) {
        await CrimeCache.update(ns, crime);
    }
    
}
