# Database Transactions

## Risky Operation: User Registration with Welcome Tasks

### Problem
Creating a user and their initial tasks is a **multi-step operation**:
1. Insert user into `User` table
2. Hash password
3. Create multiple welcome tasks

**Risk**: If step 3 fails, we have a user without welcome tasks (inconsistent state).

---

## Solution: Prisma Transaction

### Implementation

```typescript
// src/services/user-registration.service.ts
import { prisma } from '../lib/prisma';
import { hashPassword } from '../lib/password';

interface RegisterUserData {
  email: string;
  password: string;
  name?: string;
}

/**
 * Register user with initial welcome tasks atomically
 * Uses transaction to ensure all-or-nothing behavior
 */
export async function registerUserWithTasks(data: RegisterUserData) {
  return await prisma.$transaction(async (tx) => {
    // Step 1: Create user
    const hashedPassword = await hashPassword(data.password);
    const user = await tx.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
      },
    });

    // Step 2: Create welcome tasks
    const welcomeTasks = [
      {
        title: 'Welcome to the app!',
        description: 'Get started by creating your first task',
        status: 'active' as const,
        userId: user.id,
      },
      {
        title: 'Explore features',
        description: 'Try out filtering, sorting, and search',
        status: 'draft' as const,
        userId: user.id,
      },
    ];

    await tx.task.createMany({
      data: welcomeTasks,
    });

    // Step 3: Return user with task count
    const taskCount = await tx.task.count({
      where: { userId: user.id },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      taskCount,
    };
  });
}
```

---

## Rollback Behavior

### Success Case
```typescript
const result = await registerUserWithTasks({
  email: 'new@example.com',
  password: 'password123',
  name: 'New User',
});

// Result: User created + 2 tasks created
console.log(result);
// { user: { id: 'xxx', email: 'new@example.com' }, taskCount: 2 }
```

### Failure Case - Rollback Triggered
```typescript
// Simulate failure during task creation
try {
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email: 'fail@example.com', password: 'hash', name: 'Fail' }
    });
    
    // This fails (e.g., validation error)
    await tx.task.create({
      data: {
        title: '', // Empty title violates constraint!
        userId: user.id,
      }
    });
  });
} catch (error) {
  console.error('Transaction failed, rolling back...');
  
  // Check database: User NOT created
  const user = await prisma.user.findUnique({
    where: { email: 'fail@example.com' }
  });
  console.log(user); // null - rollback worked!
}
```

---

## Other Risky Operations

### 1. Transfer Task Ownership
```typescript
async function transferTasksToUser(fromUserId: string, toUserId: string) {
  return await prisma.$transaction(async (tx) => {
    // Verify both users exist
    const [fromUser, toUser] = await Promise.all([
      tx.user.findUniqueOrThrow({ where: { id: fromUserId } }),
      tx.user.findUniqueOrThrow({ where: { id: toUserId } }),
    ]);

    // Transfer all tasks
    const result = await tx.task.updateMany({
      where: { userId: fromUserId, deletedAt: null },
      data: { userId: toUserId },
    });

    return { transferred: result.count };
  });
}
```

### 2. Bulk Delete with Audit Log
```typescript
async function bulkDeleteTasksWithAudit(userId: string, taskIds: string[]) {
  return await prisma.$transaction(async (tx) => {
    // Soft delete tasks
    await tx.task.updateMany({
      where: { id: { in: taskIds }, userId },
      data: { deletedAt: new Date() },
    });

    // Create audit log entry
    await tx.auditLog.create({
      data: {
        action: 'BULK_DELETE',
        userId,
        metadata: { taskIds, count: taskIds.length },
      },
    });

    return { deleted: taskIds.length };
  });
}
```

---

## Transaction Isolation Levels

Prisma uses PostgreSQL's default isolation level: **READ COMMITTED**

```typescript
// Custom isolation level
await prisma.$transaction(
  async (tx) => {
    // Your operations
  },
  {
    isolationLevel: 'Serializable', // Strictest
    maxWait: 5000,   // 5s max wait for transaction start
    timeout: 10000,  // 10s max transaction duration
  }
);
```

**Levels**:
- `ReadUncommitted` - Allows dirty reads
- `ReadCommitted` - Default, prevents dirty reads
- `RepeatableRead` - Prevents non-repeatable reads
- `Serializable` - Strictest, prevents phantom reads

---

## Best Practices

1. **Keep transactions short** - Hold locks for minimal time
2. **Avoid external API calls** - Network delays block database
3. **Use batch operations** - `createMany` instead of multiple `create`
4. **Handle timeouts** - Set reasonable `maxWait` and `timeout`
5. **Test rollback scenarios** - Ensure cleanup works

---

## Testing Transactions

```typescript
// tests/integration/transactions.test.ts
import { describe, it, expect } from 'vitest';
import { prisma } from '../src/lib/prisma';
import { registerUserWithTasks } from '../src/services/user-registration.service';

describe('User Registration Transaction', () => {
  it('should rollback on failure', async () => {
    const email = 'rollback@test.com';
    
    // Force failure by using duplicate email
    await prisma.user.create({
      data: { email, password: 'hash' }
    });

    try {
      await registerUserWithTasks({
        email, // Duplicate!
        password: 'password',
      });
    } catch (error) {
      // Expected to fail
    }

    // Verify no tasks were created
    const tasks = await prisma.task.findMany({
      where: { user: { email } }
    });
    
    expect(tasks).toHaveLength(0); // Rollback successful
  });
});
```

---

## When to Use Transactions

✅ **Use transactions when**:
- Creating related records (user + tasks)
- Transferring data between records
- Updating multiple tables atomically
- Need all-or-nothing guarantee

❌ **Don't use transactions for**:
- Single operations (Prisma already atomic)
- Read-only queries (no data modification)
- Operations with external APIs (use sagas/events)
