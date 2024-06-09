export const getStyleProperty = (property: string) => {
    const computedStyle = getComputedStyle(document.body);

    return computedStyle.getPropertyValue(property);
};
