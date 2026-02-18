import crypto from 'crypto';

export function computeAuditHash(payload: Record<string, unknown>): string {
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

export function generateTrackingCode(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `MHG-${year}-${random}`;
}
