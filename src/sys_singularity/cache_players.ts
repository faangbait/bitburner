import { NS } from "Bitburner";
import { PlayerInfo } from "modules/players/Players";
import { PlayerCache } from "modules/players/PlayerCache";
import { Sing } from "modules/Singularity";

export const main = async (ns: NS) => {
    if (!Sing.has_access(ns)) { return }
    const player = PlayerInfo.detail(ns);
    await PlayerCache.update(ns, player)
}
