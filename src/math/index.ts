export function rotate(cx, cy, x, y, angle) {
    let radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
        ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;

    return {x: nx, y: ny};
}

export function rotatePoint(c, p, angle) {
    return rotate(c.x, c.y, p.x, p.y, angle);
}

export function rotation(source, target) {
    return Math.atan2(target.y - source.y, target.x - source.x) * 180 / Math.PI;
}

export function unitaryNormalVector(source, target, newLength = null) {
    let center = {x: 0, y: 0},
        vector = unitaryVector(source, target, newLength);

    return rotatePoint(center, vector, 90);
}

export function unitaryVector(source, target, newLength = null) {
    let length = Math.sqrt(Math.pow(target.x - source.x, 2) + Math.pow(target.y - source.y, 2)) / Math.sqrt(newLength || 1);

    return {
        x: (target.x - source.x) / length,
        y: (target.y - source.y) / length,
    };
}