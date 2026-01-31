# Database Constraints & Validation

## Current Constraints

### User Table

#### 1. Primary Key
```sql
ALTER TABLE "User" ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
```
**Prevents**: Duplicate users, null IDs

#### 2. Unique Constraint - Email
```sql
ALTER TABLE "User" ADD CONSTRAINT "User_email_key" UNIQUE ("email");
```
**Prevents**: Multiple accounts with same email, duplicate registrations

---

### Task Table

#### 1. Primary Key
```sql
ALTER TABLE "Task" ADD CONSTRAINT "Task_pkey" PRIMARY KEY ("id");
```
**Prevents**: Duplicate tasks, null IDs

#### 2. Foreign Key - userId
```sql
ALTER TABLE "Task" 
  ADD CONSTRAINT "Task_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "User"("id") 
  ON DELETE CASCADE;
```
**Prevents**: 
- Orphaned tasks (tasks without users)
- Invalid user references
- Data integrity violations

**Cascade Behavior**: When user deleted → all their tasks deleted automatically

---

## Recommended Constraints

### 1. NOT NULL Constraints

**Schema Updates**:
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // Already implicitly NOT NULL
  name      String?  // Nullable is OK
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Task {
  id          String     @id @default(cuid())
  title       String     // Already implicitly NOT NULL
  description String?    // Nullable is OK
  status      TaskStatus @default(draft)
  userId      String     // Already implicitly NOT NULL
}
```

**SQL**:
```sql
-- Prisma enforces NOT NULL by default for non-optional fields
ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "password" SET NOT NULL;
ALTER TABLE "Task" ALTER COLUMN "title" SET NOT NULL;
ALTER TABLE "Task" ALTER COLUMN "userId" SET NOT NULL;
```

**Prevents**: Empty critical fields (email-less users, title-less tasks)

---

### 2. Check Constraint - Email Format

**SQL**:
```sql
ALTER TABLE "User" 
  ADD CONSTRAINT "User_email_format" 
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$');
```

**Prevents**: Invalid email formats bypassing app validation

---

### 3. Check Constraint - Title Length

**SQL**:
```sql
ALTER TABLE "Task" 
  ADD CONSTRAINT "Task_title_length" 
  CHECK (LENGTH(title) >= 1 AND LENGTH(title) <= 200);
```

**Prevents**: Empty or excessively long titles

---

### 4. Check Constraint - Password Length

**SQL**:
```sql
ALTER TABLE "User" 
  ADD CONSTRAINT "User_password_min_length" 
  CHECK (LENGTH(password) >= 8);
```

**Prevents**: Weak passwords (though bcrypt hashes are ~60 chars)

---

### 5. Check Constraint - Valid Timestamps

**SQL**:
```sql
ALTER TABLE "Task" 
  ADD CONSTRAINT "Task_valid_timestamps" 
  CHECK (updatedAt >= createdAt);

ALTER TABLE "Task" 
  ADD CONSTRAINT "Task_deleted_after_created" 
  CHECK (deletedAt IS NULL OR deletedAt >= createdAt);
```

**Prevents**: Logical inconsistencies (updated before created)

---

### 6. Partial Unique Constraint - Active Tasks

**SQL** (PostgreSQL):
```sql
CREATE UNIQUE INDEX "Task_unique_title_per_user" 
  ON "Task"(userId, title) 
  WHERE deletedAt IS NULL;
```

**Prevents**: Duplicate task titles per user (excluding deleted)

---

## Enhanced Schema with Constraints

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  tasks     Task[]

  @@map("User")
}

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

  @@index([userId, deletedAt])
  @@index([userId, status])
  @@index([createdAt(sort: Desc)])
  @@map("Task")
}
```

---

## How Constraints Prevent Bugs

### 1. Race Conditions
**Without Constraint**:
```typescript
// Two requests simultaneously create users with same email
// Both check DB, both see no user, both insert → DUPLICATE
```

**With UNIQUE Constraint**:
```sql
-- Second insert fails with constraint violation
-- App catches error and returns 409 Conflict
```

---

### 2. Data Integrity
**Without FK Constraint**:
```typescript
// User deleted manually in DB
// Tasks now point to non-existent user → ORPHANED DATA
```

**With FK + CASCADE**:
```sql
-- Deleting user automatically deletes their tasks
-- No orphaned data possible
```

---

### 3. Invalid Data
**Without CHECK Constraint**:
```typescript
// Bug in app code allows empty title
// Invalid data written to DB → DATA CORRUPTION
```

**With CHECK Constraint**:
```sql
-- DB rejects empty title regardless of app bugs
-- Defensive layer of protection
```

---

### 4. Security
**Without Constraints**:
- SQL injection could bypass app validation
- Direct DB access could corrupt data

**With Constraints**:
- DB enforces rules even if app bypassed
- Defense in depth

---

## Migration to Add Constraints

```sql
-- Add custom constraints (Prisma doesn't support all natively)
-- Run after migration

-- Email format validation
ALTER TABLE "User" 
  ADD CONSTRAINT "User_email_format" 
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$');

-- Title length validation  
ALTER TABLE "Task" 
  ADD CONSTRAINT "Task_title_length" 
  CHECK (LENGTH(title) >= 1 AND LENGTH(title) <= 200);

-- Timestamp consistency
ALTER TABLE "Task" 
  ADD CONSTRAINT "Task_valid_timestamps" 
  CHECK (updatedAt >= createdAt);

-- Partial unique index
CREATE UNIQUE INDEX "Task_unique_title_per_user" 
  ON "Task"(userId, title) 
  WHERE deletedAt IS NULL;
```

---

## Best Practices

1. **Use Constraints as Last Line of Defense** - Not substitute for app validation
2. **Add Constraints Early** - Harder to add to populated tables
3. **Test Constraint Violations** - Ensure app handles errors gracefully
4. **Document Each Constraint** - Explain business rules
5. **Monitor Constraint Errors** - May indicate app bugs

---

## Testing Constraints

```typescript
// Test email uniqueness
try {
  await prisma.user.create({
    data: { email: 'existing@example.com', password: 'hash' }
  });
} catch (e) {
  if (e.code === 'P2002') {
    // Unique constraint violation - expected!
  }
}

// Test FK cascade
await prisma.user.delete({ where: { id: 'user_id' } });
const orphans = await prisma.task.findMany({ where: { userId: 'user_id' } });
expect(orphans).toHaveLength(0); // All tasks deleted
```
