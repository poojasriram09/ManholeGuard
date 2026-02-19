/**
 * User Migration Script: Prisma → Firebase Auth
 *
 * Migrates existing users with bcrypt-hashed passwords to Firebase Auth
 * using the importUsers() API, which natively supports bcrypt hash import.
 *
 * Usage:
 *   npx tsx scripts/migrate-users-to-firebase.ts
 *
 * Prerequisites:
 *   - GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_KEY env var set
 *   - DATABASE_URL env var set
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth, UserImportRecord } from 'firebase-admin/auth';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
const app = serviceAccount
  ? initializeApp({ credential: cert(JSON.parse(serviceAccount)) })
  : initializeApp();

const firebaseAuth = getAuth(app);
const prisma = new PrismaClient();

async function migrateUsers() {
  console.log('Fetching users from database...');
  const users = await prisma.user.findMany({
    where: { firebaseUid: null }, // Only migrate users not yet linked
    select: { id: true, email: true, passwordHash: true, role: true },
  });

  if (users.length === 0) {
    console.log('No users to migrate.');
    return;
  }

  console.log(`Found ${users.length} users to migrate.`);

  // Firebase importUsers supports max 1000 users per batch
  const batchSize = 1000;
  let migrated = 0;
  let failed = 0;

  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);
    const importRecords: UserImportRecord[] = batch
      .filter((u) => u.passwordHash) // Only import users with passwords
      .map((user) => ({
        uid: user.id, // Use Prisma UUID as Firebase UID for simplicity
        email: user.email,
        emailVerified: true,
        passwordHash: Buffer.from(user.passwordHash!),
        customClaims: { role: user.role },
      }));

    if (importRecords.length === 0) continue;

    try {
      const result = await firebaseAuth.importUsers(importRecords, {
        hash: {
          algorithm: 'BCRYPT',
        },
      });

      migrated += result.successCount;
      failed += result.failureCount;

      if (result.errors.length > 0) {
        for (const err of result.errors) {
          console.error(`  Failed: index=${err.index} error=${err.error.message}`);
        }
      }

      // Update Prisma records with Firebase UIDs
      for (const record of importRecords) {
        const user = batch.find((u) => u.id === record.uid);
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: { firebaseUid: record.uid },
          });
        }
      }

      console.log(`Batch ${Math.floor(i / batchSize) + 1}: ${result.successCount} success, ${result.failureCount} failed`);
    } catch (error) {
      console.error(`Batch ${Math.floor(i / batchSize) + 1} failed:`, error);
      failed += batch.length;
    }
  }

  console.log(`\nMigration complete: ${migrated} migrated, ${failed} failed out of ${users.length} total`);
}

migrateUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
