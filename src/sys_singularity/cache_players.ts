import { NS } from "Bitburner";
import { PlayerInfo } from "modules/players/Players";
import { PlayerCache } from "modules/players/PlayerCache";

export const main = async (ns: NS) => {
    const player = PlayerInfo.detail(ns);
    await PlayerCache.update(ns, player)
}
