import { NS } from "Bitburner";
import { AugmentationInfo } from "modules/augmentations/Augmentations";
import { AugCache } from "modules/augmentations/AugmentationCache";

export const main = async (ns: NS) => {
    for (const aug of AugmentationInfo.all(ns)) {
        await AugCache.update(ns, aug)
    }
}
