import { NS } from "Bitburner";
import { FactionObject, ServerObject } from "Phoenix";
import { TermLogger } from "lib/Helpers";
import { CONTROL_SEQUENCES, PORTS } from "lib/Variables";

const Cache = {
    open(ns: NS, port: PORTS): ServerObject[] | FactionObject[] {
        let data = ns.peek(port);
        if (data === "NULL PORT DATA") {
            return []
        } else {
            return JSON.parse(data)
        }
    },

    async create(ns: NS, port: PORTS, obj: any): Promise<ServerObject[] | FactionObject[]> {
        let logger = new TermLogger(ns);
        let cached = Cache.open(ns, port) as ServerObject[] | FactionObject[];
        cached.push(obj);
        ns.clearPort(port);
        if (!await ns.tryWritePort(port, JSON.stringify(cached))) {
            logger.err(`Couldn't write data for ${obj.id} to port ${port}`)
        }
        return cached
    },

    read(ns:NS, port: PORTS, id: any): ServerObject | FactionObject | undefined {
        let logger = new TermLogger(ns);
        let cached = Cache.open(ns, port)  as ServerObject[] | FactionObject[];
        for (const obj of cached) {
            if (obj.id === id) { return obj }
        }
        logger.err(`Couldn't read data for ${id} from port ${port}`)
        return undefined
    },

    async update(ns: NS, port: PORTS, obj: ServerObject | FactionObject) : Promise<ServerObject[] | FactionObject[]> {
        let logger = new TermLogger(ns);
        let cached = Cache.open(ns, port);
        let result = [obj];

        for (const o of cached) {
            if (o.id !== obj.id) {
                result.push(o)
            }
        }

        ns.clearPort(port);
        if (!await ns.tryWritePort(port, JSON.stringify(result))) {
            logger.err(`Couldn't write data for ${obj.id} to port ${port}`)
        }
        return result as ServerObject[] | FactionObject[]
    },

    async delete(ns: NS, port: PORTS, id: any): Promise<ServerObject[] | FactionObject[]> {
        let logger = new TermLogger(ns);
        let cached = Cache.open(ns, port);

        let result: any[] = [];

        for (const o of cached) {
            if (o.id !== id) {
                result.push(o)
            }
        }

        ns.clearPort(port);
        if (!await ns.tryWritePort(port, JSON.stringify(result))) {
            logger.err(`Couldn't delete data for ${id} from port ${port}`)
        }
        return result as ServerObject[] | FactionObject[]
    } 
}

export const ServerCache = {
    open(ns: NS): ServerObject[] {
        return Cache.open(ns, PORTS.servers) as ServerObject[];
    },

    async create(ns: NS, obj: ServerObject): Promise<ServerObject[]> {
        return await Cache.create(ns, PORTS.servers, obj) as ServerObject[];
    },

    read(ns: NS, id: string): ServerObject | null {
        return Cache.read(ns, PORTS.servers, id) as ServerObject | null;
    },

    async update(ns: NS, obj: ServerObject): Promise<ServerObject[]> {
        return await Cache.update(ns, PORTS.servers, obj) as ServerObject[];
    },

    async delete(ns: NS, id: string): Promise<ServerObject[]> {
        return await Cache.delete(ns, PORTS.servers, id) as ServerObject[];
    }
}

export const FactionCache = {
    open(ns: NS): FactionObject[] {
        return Cache.open(ns, PORTS.factions) as FactionObject[];
    },

    async create(ns: NS, obj: FactionObject): Promise<FactionObject[]> {
        return await Cache.create(ns, PORTS.factions, obj) as FactionObject[];
    },

    read(ns: NS, id: string): FactionObject | null {
        return Cache.read(ns, PORTS.factions, id) as FactionObject | null;
    },

    async update(ns: NS, obj: FactionObject): Promise<FactionObject[]> {
        return await Cache.update(ns, PORTS.factions, obj) as FactionObject[];
    },

    async delete(ns: NS, id: string): Promise<FactionObject[]> {
        return await Cache.delete(ns, PORTS.factions, id) as FactionObject[];
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
                await ns.sleep(10);
            }
            break;
        default:
            break;
    }
}


