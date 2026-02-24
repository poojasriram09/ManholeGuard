/**
 * Migrate all Prisma seed users to Firebase Auth.
 *
 * For each user in the database:
 *  1. If they already have a firebaseUid — skip.
 *  2. Try to create them in Firebase Auth with password123.
 *  3. If Firebase says email already exists, fetch the existing UID.
 *  4. Update the Prisma record with the firebaseUid.
 *
 * Usage:  cd apps/api && npx tsx scripts/migrate-users-to-firebase.ts
 */

import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// ── Firebase Admin init ──
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!serviceAccount) {
  console.error('FIREBASE_SERVICE_ACCOUNT_KEY not set in .env');
  process.exit(1);
}

if (getApps().length === 0) {
  initializeApp({ credential: cert(JSON.parse(serviceAccount)) });
}
const firebaseAuth = getAuth();

// ── Prisma init ──
const prisma = new PrismaClient();

const DEFAULT_PASSWORD = 'password123';

async function migrate() {
  const users = await prisma.user.findMany();
  console.log(`Found ${users.length} users in database\n`);

  let created = 0;
  let linked = 0;
  let skipped = 0;
  let errors = 0;

  for (const user of users) {
    // Already linked
    if (user.firebaseUid) {
      console.log(`  SKIP  ${user.email} — already has firebaseUid`);
      skipped++;
      continue;
    }

    try {
      let firebaseUid: string;

      try {
        // Try to create new Firebase user
        const fbUser = await firebaseAuth.createUser({
          email: user.email,
          password: DEFAULT_PASSWORD,
          emailVerified: true,
        });
        firebaseUid = fbUser.uid;
        console.log(`  CREATE  ${user.email} → ${firebaseUid}`);
        created++;
      } catch (err: any) {
        if (err.code === 'auth/email-already-exists') {
          // Already exists in Firebase — fetch UID
          const existing = await firebaseAuth.getUserByEmail(user.email);
          firebaseUid = existing.uid;
          console.log(`  LINK  ${user.email} → ${firebaseUid} (already in Firebase)`);
          linked++;
        } else {
          throw err;
        }
      }

      // Set custom claims for role
      await firebaseAuth.setCustomUserClaims(firebaseUid, { role: user.role });

      // Update Prisma record
      await prisma.user.update({
        where: { id: user.id },
        data: { firebaseUid },
      });

    } catch (err: any) {
      console.error(`  ERROR  ${user.email} — ${err.message}`);
      errors++;
    }
  }

  console.log(`\nDone: ${created} created, ${linked} linked, ${skipped} skipped, ${errors} errors`);
}

migrate()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
