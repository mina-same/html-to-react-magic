import type { QueryKey } from "@tanstack/react-query";

/**
 * Centralised, hierarchical query keys.
 *
 * Using a factory keeps invalidation predictable: invalidating `keys.orgs()`
 * refetches every orgs list, while `keys.org(id)` targets a single org.
 */
export const keys = {
  // Admin — platform-wide collections
  orgs: (): QueryKey => ["admin", "orgs"],
  org: (id: string): QueryKey => ["admin", "orgs", id],
  adminInfluencers: (): QueryKey => ["admin", "influencers"],
  requests: (): QueryKey => ["admin", "requests"],
  matches: (): QueryKey => ["admin", "matches"],
  reports: (): QueryKey => ["admin", "reports"],

  // Association-scoped collections (keyed by assocId so queries are isolated)
  employees: (assocId: string): QueryKey => ["assoc", assocId, "employees"],
  tasks: (assocId: string): QueryKey => ["assoc", assocId, "tasks"],
  campaigns: (assocId: string): QueryKey => ["assoc", assocId, "campaigns"],
  donations: (assocId: string): QueryKey => ["assoc", assocId, "donations"],
  content: (assocId: string): QueryKey => ["assoc", assocId, "content"],
  assocProfile: (assocId: string): QueryKey => ["assoc", assocId, "profile"],

  // Global influencers list (shared by admin + association dashboards)
  influencers: (): QueryKey => ["influencers"],

  // Employee-scoped
  myTasks: (assocId: string, userId: string): QueryKey => [
    "assoc",
    assocId,
    "tasks",
    "mine",
    userId,
  ],
  myEmployee: (assocId: string, userId: string): QueryKey => [
    "assoc",
    assocId,
    "employee",
    "mine",
    userId,
  ],
} as const;
