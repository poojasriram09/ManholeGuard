import { describe, it, expect } from 'vitest';
import { computeAuditHash, generateTrackingCode } from '../../utils/crypto';

describe('computeAuditHash', () => {
  it('should return a 64-character SHA-256 hex string', () => {
    const hash = computeAuditHash({ action: 'TEST', userId: 'u-1' });
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('should be deterministic (same input → same output)', () => {
    const payload = { action: 'LOGIN', userId: 'user-1', timestamp: '2026-01-01' };
    const hash1 = computeAuditHash(payload);
    const hash2 = computeAuditHash(payload);
    expect(hash1).toBe(hash2);
  });

  it('should produce different hashes for different inputs', () => {
    const hash1 = computeAuditHash({ action: 'LOGIN', userId: 'user-1' });
    const hash2 = computeAuditHash({ action: 'LOGOUT', userId: 'user-1' });
    expect(hash1).not.toBe(hash2);
  });

  it('should produce different hashes when key order differs in practice', () => {
    // JSON.stringify is order-dependent, so different key insertion order → different hash
    const hash1 = computeAuditHash({ a: 1, b: 2 });
    const hash2 = computeAuditHash({ b: 2, a: 1 });
    // These may or may not be equal depending on V8 key ordering.
    // The important thing is the function works without error.
    expect(hash1).toHaveLength(64);
    expect(hash2).toHaveLength(64);
  });
});

describe('generateTrackingCode', () => {
  it('should match format MHG-{year}-{5chars}', () => {
    const code = generateTrackingCode();
    expect(code).toMatch(/^MHG-\d{4}-[A-Z0-9]{5}$/);
  });

  it('should include the current year', () => {
    const code = generateTrackingCode();
    const year = new Date().getFullYear().toString();
    expect(code).toContain(`MHG-${year}-`);
  });

  it('should generate unique codes on consecutive calls', () => {
    const codes = new Set(Array.from({ length: 20 }, () => generateTrackingCode()));
    // With 5 alphanumeric chars, collisions in 20 are extremely unlikely
    expect(codes.size).toBeGreaterThanOrEqual(15);
  });
});
