/**
 * Note: OK for main script to use this file
 */
import { NS } from "Bitburner";
import { Process, RESERVED_HOME_RAM, ServerObject } from "./ServerEnums";

class Server {
    id: string;
    hostname: string;
    admin: boolean;
    ip: string;
    level: number;
    purchased: boolean;
    connected: boolean;
    backdoored: boolean;
    cores: number;
    ram: {used: number, max: number, free: number, trueMax: number };
    power: number;
    organization: string;
    isHome: boolean;
    ports: { required: number; open: number; ftp: boolean; http: boolean; smtp: boolean; sql: boolean; ssh: boolean; };
    security: { level: number; min: number; };
    money: { available: number; max: number; growth: number; };
    hackTime: number;
    growTime: number;
    weakenTime: number;
    isTarget: boolean;
    isAttacker: boolean;
    pids: Process[];
    targeted_by: Process[];
    sudo: () => void;
    threadCount: (scriptRam: number, strictMode: boolean) => number;

    constructor(ns: NS, hostname: string) {
        let data = ns.getServer(hostname);

        this.id = hostname;
        this.hostname = hostname;
        this.admin = data.hasAdminRights;
        this.ip = data.ip;
        this.level = data.requiredHackingSkill;
        this.purchased = (data.purchasedByPlayer && data.hostname !== "home");
        this.connected = data.isConnectedTo;
        this.backdoored = data.backdoorInstalled;
        this.cores = data.cpuCores;
        this.ram = {
            used: data.ramUsed,
            max: data.maxRam - (data.hostname === "home" ? RESERVED_HOME_RAM : 0),
            free: Math.max(0, data.maxRam - data.ramUsed - (data.hostname === "home" ? RESERVED_HOME_RAM : 0)),
            trueMax: data.maxRam
        };

        this.power = Math.max(0, Math.log2(data.maxRam));
        this.organization = data.organizationName;
        this.isHome = (data.hostname === "home");
        this.ports = {
            required: data.numOpenPortsRequired,
            open: data.openPortCount,
            ftp: data.ftpPortOpen,
            http: data.httpPortOpen,
            smtp: data.smtpPortOpen,
            sql: data.sqlPortOpen,
            ssh: data.sshPortOpen
        };
        this.security = {
            level: data.hackDifficulty,
            min: data.minDifficulty,
        };
        this.money = {
            available: data.moneyAvailable,
            max: data.moneyMax,
            growth: data.serverGrowth
        };
        this.hackTime = Math.ceil(ns.getHackTime(data.hostname));
        this.growTime = Math.ceil(ns.getHackTime(data.hostname) * 3.2);
        this.weakenTime = Math.ceil(ns.getHackTime(data.hostname) * 4);
        this.isTarget = (
            !data.purchasedByPlayer && 
            data.hostname !== "home" &&
            data.moneyMax > 0 && 
            data.openPortCount >= data.numOpenPortsRequired &&
            data.hasAdminRights && 
            data.requiredHackingSkill <= ns.getHackingLevel()
        );
        this.isAttacker = (
            data.purchasedByPlayer || 
            data.hostname === "home" || 
            (data.maxRam > 0 && data.hasAdminRights)
        );
        this.pids = Array.from(ns.ps(hostname).map(p => {
            let t: string | null = null;

            if (p.args[0] in ServerInfo.names(ns)) {
                t = p.args[0];
            }

            return Object.create({
                filename: p.filename,
                threads: p.threads,
                args: p.args,
                pid: p.pid,
                owner: hostname,
                target: t
            })
        }));
        this.targeted_by = Array.from(ns.ps(hostname).map(p => {
            let t: string | null = null;

            if (p.args[0] in ServerInfo.names(ns)) {
                t = p.args[0];
            }

            return Object.create({
                filename: p.filename,
                threads: p.threads,
                args: p.args,
                pid: p.pid,
                owner: hostname,
                target: t
            })
        })).filter(p => p.target && p.target.id == hostname);

        this.sudo = function () {
            if (!this.admin) {
                try {
                    ns.brutessh(this.id);
                    ns.ftpcrack(this.id);
                    ns.relaysmtp(this.id);
                    ns.httpworm(this.id);
                    ns.sqlinject(this.id);
                }
                catch { }
                finally {
                    ns.nuke(this.id)
                }
            }
        }

        this.threadCount = function (scriptRam: number, strictMode = false): number {
            let threads = Math.floor(this.ram.free / scriptRam);

            if (strictMode && threads <= 0) {
                throw "no threads available";
            }
            return threads;
        }
    }

}

/**
 * Returns a list of Server objects
 */
export const ServerInfo = {
    all(ns: NS): Server[] {
        return ServerInfo.names(ns).map(s => ServerInfo.detail(ns, s))
    },
    detail(ns: NS, hostname: string): Server {
        return new Server(ns, hostname);
    },
    names(ns: NS, current="home", set=new Set(["home"])) : string[] {
        let connections = ns.scan(current)
        let next = connections.filter(c => !set.has(c))
        next.forEach(n => {
            set.add(n);
            return ServerInfo.names(ns, n, set)
        })
        return Array.from(set.keys())
    }
}
