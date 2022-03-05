export const calcRSI = (closes:number[]) => {
    let hights:number = 0;
    let downs:number = 0;

    closes.forEach((price, i) => {
        let difference = 0;
        if(i === 0) hights += difference;
        else {
            difference = price - closes[i - 1];
            if(difference >= 0) hights += difference;
            else downs -= difference;
        }
    });

    const relativeStrength = hights / downs;
    return 100 - (100 / (1 + relativeStrength));
}