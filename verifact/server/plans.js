// plans.js — per-plan limits and quota helpers.
//
// Single source of truth for what each plan is allowed to do. Until Stripe is
// wired up, the "plan" is derived directly from the user's role. When paid
// plans ship, add a `plan` column to users and route through `resolvePlan()`.

import { query } from './db.js';

/**
 * Plan definitions. Keep these flat and serializable — the frontend also
 * imports a mirror of this shape in `src/lib/plans.js`.
 */
export const PLANS = {
  student_free: {
    id: 'student_free',
    label: 'Student — Free',
    dailyUploads: 3,
    maxDocChars: 12000,
    bulkUpload: false,
    bulkMaxFiles: 0,
  },
  educator_free: {
    id: 'educator_free',
    label: 'Educator — Free',
    dailyUploads: 30,
    maxDocChars: 24000,
    bulkUpload: true,
    bulkMaxFiles: 20,
  },
  admin: {
    id: 'admin',
    label: 'Admin',
    dailyUploads: Infinity,
    maxDocChars: 24000,
    bulkUpload: true,
    bulkMaxFiles: 50,
  },
};

/**
 * Resolve the plan object for a given user record. Admins always get the
 * admin plan; otherwise the plan is picked from the user's role.
 */
export function resolvePlan(user) {
  if (!user) return PLANS.student_free;
  if (user.is_admin) return PLANS.admin;
  if (user.role === 'educator') return PLANS.educator_free;
  return PLANS.student_free;
}

/**
 * Count uploads a user has made since UTC midnight today.
 */
export async function uploadsToday(userId) {
  const midnight = new Date();
  midnight.setUTCHours(0, 0, 0, 0);
  const row = await query.get(
    `SELECT COUNT(*) AS cnt FROM documents
     WHERE user_id = ? AND uploaded_at >= ?`,
    [userId, midnight.toISOString()]
  );
  return row?.cnt ?? 0;
}

/**
 * Check whether a user is allowed to upload `count` more documents right now.
 * Returns { allowed, remaining, limit, plan }.
 */
export async function checkUploadQuota(user, count = 1) {
  const plan = resolvePlan(user);
  if (plan.dailyUploads === Infinity) {
    return { allowed: true, remaining: Infinity, limit: Infinity, plan };
  }
  const used = await uploadsToday(user.user_id);
  const remaining = Math.max(0, plan.dailyUploads - used);
  return {
    allowed: remaining >= count,
    remaining,
    limit: plan.dailyUploads,
    plan,
  };
}
