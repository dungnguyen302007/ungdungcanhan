import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatMonth } from '../format';

describe('formatCurrency', () => {
    it('should format VND currency correctly', () => {
        const result = formatCurrency(1000000);
        // Vietnamese locale formats as "1.000.000 ₫" or "₫1.000.000" depending on version
        expect(result).toContain('1.000.000');
        expect(result).toContain('₫');
    });

    it('should handle zero', () => {
        const result = formatCurrency(0);
        expect(result).toContain('0');
        expect(result).toContain('₫');
    });

    it('should format small amounts', () => {
        const result = formatCurrency(100);
        expect(result).toContain('100');
        expect(result).toContain('₫');
    });

    it('should format large amounts', () => {
        const result = formatCurrency(99999999);
        expect(result).toContain('99.999.999');
        expect(result).toContain('₫');
    });

    it('should format negative amounts', () => {
        const result = formatCurrency(-5000);
        expect(result).toContain('5.000');
        expect(result).toContain('₫');
    });

    it('should handle extremely large numbers', () => {
        const result = formatCurrency(999999999999);
        expect(result).toBe('99 tỷ+');
    });

    it('should handle NaN safely', () => {
        const result = formatCurrency(NaN);
        expect(result).toContain('0');
    });

    it('should handle Infinity safely', () => {
        const result = formatCurrency(Infinity);
        expect(result).toContain('0');
    });
});

describe('formatDate', () => {
    it('should format date correctly with default format', () => {
        const date = new Date('2026-01-20');
        const formatted = formatDate(date);
        expect(formatted).toBe('20/01/2026');
    });

    it('should format date with custom format', () => {
        const date = new Date('2026-01-20');
        const formatted = formatDate(date, 'yyyy-MM-dd');
        expect(formatted).toBe('2026-01-20');
    });

    it('should handle string input', () => {
        const formatted = formatDate('2026-01-20', 'dd/MM/yyyy');
        expect(formatted).toBe('20/01/2026');
    });

    it('should handle timestamp input', () => {
        const timestamp = new Date('2026-01-20').getTime();
        const formatted = formatDate(timestamp);
        expect(formatted).toBe('20/01/2026');
    });
});

describe('formatMonth', () => {
    it('should format month correctly', () => {
        const date = new Date('2026-01-20');
        const formatted = formatMonth(date);
        // Vietnamese locale: "tháng 1 2026" or "Tháng Một 2026"
        expect(formatted).toContain('2026');
        expect(formatted.toLowerCase()).toContain('tháng');
    });

    it('should handle string input', () => {
        const formatted = formatMonth('2026-12-25');
        expect(formatted).toContain('2026');
    });

    it('should handle December correctly', () => {
        const formatted = formatMonth('2026-12-01');
        expect(formatted).toContain('2026');
        expect(formatted.toLowerCase()).toContain('tháng');
    });
});
