// which "day" a moment belongs to. the canvas starts blank at midnight in this timezone, and the
// worker and the page must agree on where midnight is.

export const TIMEZONE = 'America/New_York';

const format = new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit' });

// ms since epoch -> 'YYYY-MM-DD' in TIMEZONE
export function dayOf(ms) {
    return format.format(ms);
}
