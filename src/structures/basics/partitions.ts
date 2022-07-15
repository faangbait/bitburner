export const partition_array = (arr: any[], cmp: (a: any) => boolean) => {
    let truthy: any[] = [];
    let falsy: any[] = [];

    for (const a of arr) {
        if (cmp(a)) { truthy.push(a) } else { falsy.push(a) }
    }
    return {truthy, falsy}
    
}
