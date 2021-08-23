
export const getDeltaDegreeOfVisibilityCone = (heightInKm: number) => {
    const r = 6371;
    const h = 6371 + heightInKm
    const alpha = Math.sqrt(h*h - r*r) / h;
    return Math.asin(alpha) * 180 / Math.PI
}
