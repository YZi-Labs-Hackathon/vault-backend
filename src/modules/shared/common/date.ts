export function toEpochSeconds(date: Date | number): number {
    if (date instanceof Date) {
        return Math.floor(date.getTime() / 1000);
    }
    return Math.floor(date / 1000);
}

export function getDateToday() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime() / 1000;
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).getTime() / 1000;
    return { startOfDay, endOfDay };
}
