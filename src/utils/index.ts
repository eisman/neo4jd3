export function contains(array, id) {
    let filter = array.filter(elem => elem.id === id);

    return filter.length > 0;
}

export function merge(target, source) {
    Object.keys(source).forEach(function (property) {
        target[property] = source[property];
    });
}