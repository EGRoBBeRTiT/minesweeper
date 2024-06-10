export const localStorageSetItem = (key: string, value: string) => {
    try {
        return localStorage.setItem(key, value);
    } catch (error) {
        return undefined;
    }
};
