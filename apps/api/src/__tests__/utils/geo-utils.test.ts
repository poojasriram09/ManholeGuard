import { describe, it, expect } from 'vitest';
import { haversineDistance } from '../../utils/geo-utils';

describe('haversineDistance', () => {
  it('should return 0 for identical coordinates', () => {
    const d = haversineDistance(19.076, 72.877, 19.076, 72.877);
    expect(d).toBe(0);
  });

  it('should calculate known Mumbai distance (~5.5 km between Dadar and Andheri)', () => {
    // Dadar: 19.0178, 72.8478 → Andheri: 19.1197, 72.8464
    const d = haversineDistance(19.0178, 72.8478, 19.1197, 72.8464);
    expect(d).toBeGreaterThan(5000);
    expect(d).toBeLessThan(12000);
  });

  it('should detect short distance (~50 m) for nearby points', () => {
    // Two points ~50m apart (approx 0.00045 degrees latitude)
    const d = haversineDistance(19.076, 72.877, 19.07645, 72.877);
    expect(d).toBeGreaterThan(40);
    expect(d).toBeLessThan(60);
  });

  it('should work on the equator', () => {
    // 1 degree of longitude at equator ≈ 111,320 m
    const d = haversineDistance(0, 0, 0, 1);
    expect(d).toBeGreaterThan(111000);
    expect(d).toBeLessThan(112000);
  });

  it('should be commutative (A→B === B→A)', () => {
    const d1 = haversineDistance(19.076, 72.877, 19.119, 72.846);
    const d2 = haversineDistance(19.119, 72.846, 19.076, 72.877);
    expect(d1).toBeCloseTo(d2, 6);
  });

  it('should return result in meters', () => {
    // 1 degree latitude ≈ 111,195 m — must be in meters not km
    const d = haversineDistance(0, 0, 1, 0);
    expect(d).toBeGreaterThan(100000);
    expect(d).toBeLessThan(120000);
  });

  it('should handle antipodal points (max distance ~20,000 km)', () => {
    const d = haversineDistance(0, 0, 0, 180);
    expect(d).toBeGreaterThan(20_000_000);
    expect(d).toBeLessThan(20_100_000);
  });
});
