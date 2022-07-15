/**
 * Note: File is meant to be zero ram and imported
 */
import { NS } from "Bitburner";

// Non-Singularity version - use one or the other
export enum CACHE_SCRIPTS {
    BITNODES = `/sys/cache_bitnode.js`,
    AUGMENTATIONS = `/sys/cache_augmentations.js`,
    FACTIONS = `/sys/cache_factions.js`,
    SERVERS = `/sys/cache_servers.js`,
    PLAYERS = `/sys/cache_players.js`,
    CORPORATIONS = `/sys/cache_corporations.js`,
    SLEEVES = `/sys/cache_sleeves.js`,
    CRIMES = `/sys/cache_crimes.js`,
}

// Singularity version - use one or the other
// export enum CACHE_SCRIPTS {
//     BITNODES = `/sys_singularity/cache_bitnode.js`,
//     AUGMENTATIONS = `/sys_singularity/cache_augmentations.js`,
//     FACTIONS = `/sys_singularity/cache_factions.js`,
//     SERVERS = `/sys_singularity/cache_servers.js`,
//     PLAYERS = `/sys_singularity/cache_players.js`,
//     CORPORATIONS = `/sys_singularity/cache_corporations.js`,
//     SLEEVES = `/sys_singularity/cache_sleeves.js`,
//     CRIMES = `/sys_singularity/cache_crimes.js`,
// }

export enum PORTS {
    control = 1,
    augmentations,
    heartbeat,
    swap,
    factions,
    servers,
    bitnodes,
    players,
    corporations,
    sleeves,
    crimes
}

export enum CONTROL_SEQUENCES {
    SIGHUP = 1,
    PAUSE,
    LIQUIDATE_CAPITAL
}

export const Cache = {
    all(ns: NS, port: PORTS): Map<string, any> {
        let data = ns.peek(port);
        if (data === "NULL PORT DATA") { return new Map() } else {
            let res: any[] = JSON.parse(data);
            return new Map(res.map(o => [o.id, o]))
        }
    },

    async update(ns: NS, port: PORTS, obj: any): Promise<Map<string,any>> {
        let cached = Cache.all(ns, port);
        cached.set(obj.id, obj);
        ns.clearPort(port);
        await ns.tryWritePort(port, JSON.stringify(Array.from(cached.values())))
        return cached
    },

    read(ns: NS, port: PORTS, id: string) : any {
        let cached = Cache.all(ns, port);
        return cached.get(id)
    },

    async delete(ns: NS, port: PORTS, id: any): Promise<Map<string,any>> {
        let cached = Cache.all(ns, port);
        cached.delete(id);
        ns.clearPort(port);
        await ns.tryWritePort(port, JSON.stringify(Array.from(cached.values())))
        return cached
    }
}

export const check_control_sequence = async (ns: NS) => {
    switch (ns.peek(PORTS.control)) {
        case "NULL PORT DATA":
            break;
        case CONTROL_SEQUENCES.SIGHUP:
            ns.exit();
            break;
        case CONTROL_SEQUENCES.PAUSE:
            while (ns.peek(PORTS.control) === CONTROL_SEQUENCES.PAUSE) {
                await ns.asleep(10);
            }
            break;
        default:
            break;
    }
}


