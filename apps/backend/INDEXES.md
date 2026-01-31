# Database Indexes & Query Tuning Guide

## Current Indexes

### User Table
```sql
-- Automatic from Prisma
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");
```

**Why**: 
- `email` unique index enables fast login lookups
- `id` primary key for joins

### Task Table
```sql
-- Already in schema
CREATE INDEX "Task_userId_idx" ON "Task"("userId");
CREATE INDEX "Task_deletedAt_idx" ON "Task"("deletedAt");
```

**Why**:
- `userId` index: Fast filtering by user (every list query uses this)
- `deletedAt` index: Efficient soft delete filtering

---

## Recommended Indexes

### 1. Composite Index: userId + deletedAt
**Schema**:
```prisma
@@index([userId, deletedAt])
```

**SQL**:
```sql
CREATE INDEX "Task_userId_deletedAt_idx" ON "Task"("userId", "deletedAt");
```

**Why**: Most queries filter by BOTH userId AND deletedAt. Composite index eliminates need for separate indexes.

**Query Pattern**:
```sql
SELECT * FROM Task WHERE userId = ? AND deletedAt IS NULL;
```

---

### 2. Composite Index: userId + status
**Schema**:
```prisma
@@index([userId, status])
```

**SQL**:
```sql
CREATE INDEX "Task_userId_status_idx" ON "Task"("userId", "status");
```

**Why**: Filters by user AND status (e.g., "show me active tasks").

**Query Pattern**:
```sql
SELECT * FROM Task WHERE userId = ? AND status = 'active';
```

---

### 3. Index: createdAt (Descending)
**Schema**:
```prisma
@@index([createdAt(sort: Desc)])
```

**SQL**:
```sql
CREATE INDEX "Task_createdAt_idx" ON "Task"("createdAt" DESC);
```

**Why**: Default sort order for list queries. DESC matches query pattern.

**Query Pattern**:
```sql
SELECT * FROM Task WHERE userId = ? ORDER BY createdAt DESC LIMIT 10;
```

---

### 4. Full-Text Search Index: title
**SQL** (PostgreSQL):
```sql
CREATE INDEX "Task_title_trgm_idx" ON "Task" USING gin(title gin_trgm_ops);
```

**Requires**:
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

**Why**: Case-insensitive search on task titles.

**Query Pattern**:
```sql
SELECT * FROM Task WHERE title ILIKE '%project%';
```

---

## Optimized Schema

```prisma
model Task {
  id          String     @id @default(cuid())
  title       String
  description String?
  status      TaskStatus @default(draft)
  userId      String
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  deletedAt   DateTime?

  @@index([userId, deletedAt])     // Composite for user + soft delete
  @@index([userId, status])         // Composite for user + status filter
  @@index([createdAt(sort: Desc)])  // Sort optimization
}
```

---

## Common Slow Queries to Watch

### 1. Pagination Without Indexes
```sql
-- SLOW (no index on sort column)
SELECT * FROM Task WHERE userId = ? ORDER BY title LIMIT 10 OFFSET 100;
```

**Fix**: Add index on `title` or use cursor-based pagination.

---

### 2. OR Queries
```sql
-- SLOW (can't use single index efficiently)
SELECT * FROM Task WHERE status = 'active' OR status = 'draft';
```

**Fix**: Use `IN` instead:
```sql
SELECT * FROM Task WHERE status IN ('active', 'draft');
```

---

### 3. Function on Indexed Column
```sql
-- SLOW (function prevents index usage)
SELECT * FROM Task WHERE LOWER(title) = 'project';
```

**Fix**: Use functional index or case-insensitive collation.

---

### 4. N+1 Query Problem
```typescript
// SLOW - N+1 queries
const tasks = await prisma.task.findMany();
for (const task of tasks) {
  const user = await prisma.user.findUnique({ where: { id: task.userId } });
}
```

**Fix**: Use `include`:
```typescript
const tasks = await prisma.task.findMany({
  include: { user: true }
});
```

---

## Monitoring

### Check Index Usage (PostgreSQL)
```sql
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read
FROM pg_stat_user_indexes
WHERE tablename = 'Task'
ORDER BY idx_scan DESC;
```

### Find Missing Indexes
```sql
SELECT * FROM pg_stat_user_tables WHERE relname = 'Task';
```

---

## Best Practices

1. **Index Selectivity**: High cardinality columns first (userId before status)
2. **Composite Order**: Filter columns → Sort columns
3. **Don't Over-Index**: Each index slows writes (INSERT/UPDATE/DELETE)
4. **Monitor in Production**: Use `EXPLAIN ANALYZE` before optimizing
5. **Partial Indexes**: For soft deletes, consider `WHERE deletedAt IS NULL`
