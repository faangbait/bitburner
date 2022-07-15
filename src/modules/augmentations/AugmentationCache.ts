/**
 * Note: File meant to be zero-ram and imported
 */

import { NS } from "Bitburner";
import { Cache, PORTS } from "lib/Database";
import { Augmentation } from "modules/augmentations/AugmentationEnums";

export const AugCache = {

    all(ns: NS): Map<string,Augmentation> {
        return Cache.all(ns, PORTS.augmentations)
    },

    read(ns: NS, id: string): Augmentation {
        return Cache.read(ns, PORTS.augmentations, id)
    },

    async update(ns: NS, obj: Augmentation): Promise<Map<string, Augmentation>> {
        return await Cache.update(ns, PORTS.augmentations, obj)
    },

    async delete(ns: NS, id: string): Promise<Map<string, Augmentation>> {
        return await Cache.delete(ns, PORTS.augmentations, id)
    },

}
