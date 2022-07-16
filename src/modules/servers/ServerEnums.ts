export const RESERVED_HOME_RAM = 16;

export interface ServerObject {
    id: string;
    hostname: string;
    ip: string;
    connected: boolean;
    admin: boolean;
    backdoored: boolean;
    level: number;
    cores: number;
    ram: {
        max: number;
        used: number;
        free: number;
        trueMax: number;
    }
    power: number;
    organization: string;
    purchased: boolean;
    isHome: boolean;
    ports: {
        required: number;
        open: number;
        ftp: boolean;
        http: boolean;
        smtp: boolean;
        sql: boolean;
        ssh: boolean;
    }
    security: {
        level: number;
        min: number;
    }
    money: {
        max: number;
        available: number;
        growth: number;
    },
    pids: Process[],
    targeted_by: Process[]
    hackTime: number,
    growTime: number,
    weakenTime: number,
    isAttacker: boolean,
    isTarget: boolean,
}

export interface Process {
    filename: string;
    threads: number;
    args: string[];
    pid: number;
    owner: ServerObject;
    target: ServerObject | null;
}

export interface DeploymentBundle {
    file: string,
    attacker?: string,
    threads?: number,
    args?: (string | number | boolean)[]
    priority?: number
}

export interface BatchFile {
    filename: string,
    ram: number,
    job: "hack" | "grow" | "weaken"
}
