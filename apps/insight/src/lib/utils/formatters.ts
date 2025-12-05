import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

/**
 * Format number as Indonesian Rupiah currency
 * @param value - The number to format
 * @param compact - Whether to use compact notation (K, M, B)
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, compact: boolean = false): string {
    if (value === 0) return 'Rp 0';

    if (compact) {
        // Compact format for charts
        if (Math.abs(value) >= 1_000_000_000) {
            return `Rp ${(value / 1_000_000_000).toFixed(1)}M`;
        } else if (Math.abs(value) >= 1_000_000) {
            return `Rp ${(value / 1_000_000).toFixed(1)}Jt`;
        } else if (Math.abs(value) >= 1_000) {
            return `Rp ${(value / 1_000).toFixed(0)}rb`;
        }
        return `Rp ${value.toLocaleString('id-ID')}`;
    }

    // Full format with thousand separators
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

/**
 * Format number with thousand separators
 */
export function formatNumber(value: number, decimals: number = 0): string {
    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value);
}

/**
 * Format tanggal ke format Indonesia
 */
export function formatDate(date: Date, formatString: string = 'dd MMMM yyyy'): string {
    return format(date, formatString, { locale: localeId });
}

/**
 * Format waktu
 */
export function formatTime(date: Date): string {
    return format(date, 'HH:mm', { locale: localeId });
}

/**
 * Format tanggal dan waktu
 */
export function formatDateTime(date: Date): string {
    return format(date, 'dd MMM yyyy, HH:mm', { locale: localeId });
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
    return `${formatNumber(value, decimals)}%`;
}

/**
 * Format compact number for charts (K, M, B)
 */
export function formatCompactNumber(value: number): string {
    if (Math.abs(value) >= 1_000_000_000) {
        return `${(value / 1_000_000_000).toFixed(1)}M`;
    } else if (Math.abs(value) >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(1)}Jt`;
    } else if (Math.abs(value) >= 1_000) {
        return `${(value / 1_000).toFixed(0)}rb`;
    }
    return value.toString();
}

/**
 * Truncate text dengan ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
}
