export const throttle = <Args extends [], T extends (...args: Args) => void>(
    callback: T,
    delay = 0,
) => {
    let time = Number.NaN;

    return ((...args: Args) => {
        if (Number.isNaN(time)) {
            time = new Date().getTime();
            callback(...args);
        }

        const currTime = new Date().getTime();

        if (currTime - time >= delay) {
            time = currTime;
            callback(...args);
        }
    }) as T;
};
