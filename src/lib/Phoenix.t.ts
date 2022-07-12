declare module "Phoenix" {
    /**
     * @public
     */
    interface ServerObject {
        threadCount: (scriptRam: number, strictMode?: boolean) => number;
        sudo: () => void;
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
        updated_at: number,

    }

    /**
     * @public
     */
    export interface Process {
        filename: string;
        threads: number;
        args: string[];
        pid: number;
        owner: ServerObject;
        target: ServerObject | null;
    }


    /**
     * @public
     */
    export interface BatchFile {
        filename: string,
        ram: number,
        job: string
    }

    /**
     * @public
     */
    export interface DeploymentBundle {
        file: string,
        attacker: string,
        threads: number,
        args: (string | number | boolean)[]
    }
    /**
     * @public
     */
    export interface PlayerObject {
        hp: {
            current: number;
            max: number;
        };
        money: number;
        intelligence: number;
        location: string;
        software: {
            tor: boolean;
            ssh: boolean;
            ftp: boolean;
            smtp: boolean;
            http: boolean;
            sql: boolean;
            formulas: boolean;
        };
        bladeburner: {
            multipliers: {
                analysis: number;
                max_stamina: number;
                stamina_gain: number;
                success_chance: number;
            };

        };
        city: string;
        className: string;
        company: {
            companyName: string;
            multipliers: {
                rep: number;
            };
        };
        createProgram: {
            progName: string;
            reqLevel: number;
        };

        crime: {
            type: string;
            multipliers: {
                money: number;
                success: number;
            },
            kills: number;
            karma: number;
        },

        faction: {
            membership: string[];
            multipliers: {
                rep: number;
            }
        },

        hacking: {
            exp: number;
            level: number;
            multipliers: {
                chance: number;
                exp: number;
                grow: number;
                money: number;
                level: number;
                speed: number;
            }
        },

        market: {
            api: {
                tix: boolean;
                fourSigma: boolean;
            },
            manual: {
                wse: boolean;
                fourSigma: boolean;
            }
        },

        playtime: {
            total: number;
            sinceAug: number;
            sinceBitnode: number;
        },

        ports: number;
        work: {
            isWorking: boolean;
            type: string;
            jobs: string[];
            current: {
                factionName: string;
                factionDesc: string;
            },
            multipliers: {
                money: number;
            },
            stats: {
                agi: {
                    gained: number;
                    rate: number;
                },
                str: {
                    gained: number;
                    rate: number;
                },
                cha: {
                    gained: number;
                    rate: number;
                },
                dex: {
                    gained: number;
                    rate: number;
                },
                def: {
                    gained: number;
                    rate: number;
                },
                hack: {
                    gained: number;
                    rate: number;
                },
                money: {
                    gained: number;
                    rate: number;
                    loss: number;
                },
                rep: {
                    gained: number;
                    rate: number;
                }

            }
        },
        hnet: {
            multipliers: {
                coreCost: number;
                levelCost: number;
                production: number;
                purchaseCost: number;
                ramCost: number;
            }
        };
        charisma: {
            level: number;
            exp: number;
            multipliers: {
                exp: number;
                level: number;
            }
        };
        agility: {
            level: number;
            exp: number;
            multipliers: {
                exp: number;
                level: number;
            }
        };
        dexterity: {
            level: number;
            exp: number;
            multipliers: {
                exp: number;
                level: number;
            }
        };
        defense: {
            level: number;
            exp: number;
            multipliers: {
                exp: number;
                level: number;
            }
        };
        strength: {
            level: number;
            exp: number;
            multipliers: {
                exp: number;
                level: number;
            }
        };


    }
    /**
     * @public
     */
    interface SleeveObject {
        id: number,
        hp: {
            current: number,
            max: number,
        },
        money: number,
        city: string,
        location: string,
        work: {
            isWorking: boolean,
            type: string,
            jobs: string[],
            titles: string[],
            time: number,
        },
        gym: {
            stat: string
        },
        software: {
            tor: boolean,
        },
        multipliers: {
            companyRep: number,
        },
        crime: {
            type: string,
            multipliers: {
                money: number,
                success: number,
            }
        },
        faction: {
            multipliers: {
                rep: number,
            }
        },
        agility: {
            level: number,
            multipliers: {
                exp: number,
                level: number
            },
        },
        charisma: {
            level: number,
            multipliers: {
                exp: number,
                level: number
            },
        },
        defense: {
            level: number,
            multipliers: {
                exp: number,
                level: number
            },
        },
        dexterity: {
            level: number,
            multipliers: {
                exp: number,
                level: number
            },
        },
        hacking: {
            level: number,
            multipliers: {
                exp: number,
                level: number
            },
        },
        strength: {
            level: number,
            multipliers: {
                exp: number,
                level: number
            },
        },
        shock: number,
        sync: number,
        augs: {
            owned: string[],
            buyable: { cost: number, name: string }[]
            buy: (augName: string) => boolean;
        },
        actions: {
            bladeburner: (action: string, contract?: string) => boolean
            crime: (name: string) => boolean
            work: (name: string) => boolean
            faction: (name: string, type: string) => boolean | undefined
            gym: (name: string, stat: string) => boolean
            recover: () => boolean
            sync: () => boolean
            uni: (uni: string, cls: string) => boolean
            travel: (city: string) => boolean
        }
    }

    /**
     * @public
     */
    interface HomeExec {
        file: string,
        threads: number,
        home_required: boolean,
        args: (string|number|boolean)[]
    }

    /**
     * @public
     */
    interface FactionObject {
        id: string,
        name: string,
        join_method: () => void,
    }

    /**
     * @public
     */
    interface GameStateObject {
        last_reset: number | null,
        sourcefiles: Map<number,number>,
        bitnode: {
            current: number,
            multipliers: {
                augmentations: {
                    money: number,
                    rep: number,
                    daedalus_req: number,
                },
                agility: number,
                charisma: number,
                defense: number,
                dexterity: number,
                strength: number,
                bladeburner: {
                    rank: number,
                    skill: number
                },
                gym: number,
                leetcode: number,
                company: {
                    exp: number,
                    money: number
                },
                corporation: {
                    softcap: number,
                    valuation: number
                },
                crime: {
                    exp: number,
                    money: number
                },
                faction: {
                    passive: number,
                    rep: number,
                    min_favor: number,
                    work: {
                        exp: number,
                        rep: number
                    }
                },
                tix: number,
                gang: number,
                hacking: {
                    exp: number,
                    level: number,
                    manual: number,
                    money: {
                        gain: number,
                        movement: number
                    },
                    growth: number,
                    max_money: number,
                    starting_money: number,
                    starting_sec: number,
                    weaken: number,
                    daemon: number
                },
                hacknet: number,
                purchased_servers: {
                    cost: number,
                    limit: number,
                    ram: number,
                    softcap: number,
                    home_ram: number
                }
                infiltration: {
                    money: number,
                    rep: number
                },
                stanek: {
                    power: number,
                    size: number
                }
            }
        }

    }

}
