import { NS } from "Bitburner";
import { GameStateObject } from "Phoenix";

export const GameState = {
    // writing is handled by SYSFILE_LAUNCHER
    read(ns: NS): GameStateObject {
        let gs: GameStateObject = JSON.parse(ns.read("/Temp/GameState.txt"))
        
        return gs
    },
}
