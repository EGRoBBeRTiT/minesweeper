export const localStorageGetItem = (key: string) => {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        return null;
    }
};
