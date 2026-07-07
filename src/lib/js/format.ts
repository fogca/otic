/** Zero-padded 1-based index, e.g. padNumber(0) → "01", padNumber(9) → "10".
    Shared by the home feed and the archives list numbering. */
export const padNumber = (n: number): string => String(n + 1).padStart(2, '0');
