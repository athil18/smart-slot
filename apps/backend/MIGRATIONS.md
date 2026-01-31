# Database Migrations Guide

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm run db:migrate` | Create & apply migrations (dev) |
| `npm run db:migrate:deploy` | Apply pending migrations (prod) |
| `npm run db:migrate:status` | Check migration status |
| `npm run db:migrate:reset` | Reset DB and reapply all |
| `npm run db:migrate:create` | Create migration without applying |
| `npm run db:push` | Push schema changes (prototyping) |
| `npm run db:studio` | Open Prisma Studio GUI |
| `npm run db:generate` | Regenerate Prisma Client |

---

## Development Workflow

### 1. Create Migration
```bash
# Edit prisma/schema.prisma, then:
npm run db:migrate -- --name add_feature_name
```

### 2. Apply Migrations
```bash
npm run db:migrate
```

### 3. Check Status
```bash
npm run db:migrate:status
```

---

## Production Workflow

```bash
# In CI/CD pipeline or production deployment:
npm run db:migrate:deploy
```

---

## Rollback Strategy

Prisma doesn't have built-in rollback. Use these patterns:

### Option 1: Revert Migration (Recommended)
Create a new migration that undoes the previous change:
```bash
# If previous migration added a column:
npm run db:migrate:create -- --name revert_previous_change
# Then edit SQL to drop the column
```

### Option 2: Reset (Dev Only)
```bash
npm run db:migrate:reset
# WARNING: Destroys all data!
```

### Option 3: Manual SQL
```sql
-- Mark migration as rolled back
DELETE FROM _prisma_migrations WHERE migration_name = 'xxx';
-- Then manually undo changes
```

---

## Best Practices

1. **Small, focused migrations** - One feature per migration
2. **Descriptive names** - `add_user_avatar`, not `update1`
3. **Always backup** before production deploys
4. **Test migrations** on staging first
5. **Never edit** applied migrations

---

## Emergency Recovery

```bash
# If migration fails mid-apply:
npx prisma migrate resolve --rolled-back "migration_name"

# Force mark as applied (after manual fix):
npx prisma migrate resolve --applied "migration_name"
```
