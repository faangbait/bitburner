import { NS } from "Bitburner";
import { ServerObject } from "Phoenix";
import { TermLogger } from "lib/Helpers";
import { CONTROL_SEQUENCES, PORTS } from "lib/Variables";

export const Cache = {
    open(ns: NS): ServerObject[] {
        let data = ns.peek(PORTS.servers);
        if (data === "NULL PORT DATA") {
            return []
        } else {
            return JSON.parse(data)
        }
    },

    async create(ns: NS, obj: ServerObject): Promise<ServerObject[]> {
        let logger = new TermLogger(ns);
        let cached: ServerObject[] = Cache.open(ns);
        cached.push(obj);
        ns.clearPort(PORTS.servers);
        if (!await ns.tryWritePort(PORTS.servers, JSON.stringify(cached))) {
            logger.err(`Couldn't write data for ${obj.id} to port ${PORTS.servers}`)
        }
        return cached
    },

    read(ns: NS, id: string): ServerObject | null {
        let logger = new TermLogger(ns);
        let cached: ServerObject[] = Cache.open(ns);
        let res: ServerObject | undefined = cached.filter(s => s.id === id).pop();
        if (res === undefined) {
            logger.err(`Couldn't read data for ${id} from port ${PORTS.servers}`)
            return null
        } else {
            return res
        }
    },

    async update(ns: NS, obj: ServerObject): Promise<ServerObject[]> {
        let logger = new TermLogger(ns);
        let cached: ServerObject[] = Cache.open(ns).filter(s => s.id !== obj.id);
        cached.push(obj);
        ns.clearPort(PORTS.servers);
        if (!await ns.tryWritePort(PORTS.servers, JSON.stringify(cached))) {
            logger.err(`Couldn't write data for ${obj.id} to port ${PORTS.servers}`)
        }
        return cached
    },

    async delete(ns: NS, id: string): Promise<ServerObject[]> {
        let logger = new TermLogger(ns);
        let cached: ServerObject[] = Cache.open(ns).filter(s => s.id !== id);
        ns.clearPort(PORTS.servers);
        if (!await ns.tryWritePort(PORTS.servers, JSON.stringify(cached))) {
            logger.err(`Couldn't delete data for ${id} from port ${PORTS.servers}`)
        }
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
                await ns.sleep(10);
            }
            break;
        default:
            break;
    }
}


