# Backup & Restore Plan

## Strategy Overview

| Environment | Strategy | Tool | Frequency | Retention |
|-------------|----------|------|-----------|-----------|
| **Dev** | SQL Dump | `pg_dump` | On demand | Last 3 dumps |
| **Staging** | SQL Dump | `pg_dump` | Daily | 7 days |
| **Production** | WAL-G / Managed | RDS/Compute Snapshots | Daily + Point-in-time | 30 days |

---

## 🛠️ Backup Commands

### Development (Local)
Create a database dump:
```bash
# Export
docker exec -t hyper-db pg_dump -U postgres hyper_db > backups/dev_backup_$(date +%F).sql

# Import
cat backups/dev_backup_xxx.sql | docker exec -i hyper-db psql -U postgres hyper_db
```

### Staging/Production (Manual SQL Dump)
```bash
# Export with custom format (compressed)
pg_dump -Fc -h <host> -U <user> <db_name> > backup.dump

# Restore
pg_restore -h <host> -U <user> -d <db_name> backup.dump
```

---

## 🔄 Restore Procedures

### 1. Point-in-Time Recovery (Production)
If using AWS RDS or similar:
1. Navigate to RDS Dashboard > Backups.
2. Select "Restore to point in time".
3. Choose the specific timestamp (e.g., 5 mins before the incident).
4. Launch temporary instance to verify data.
5. Swap application connection string.

### 2. Manual SQL Restore
1. **Stop Application**: Prevent data writes.
2. **Clear Target DB**: `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`
3. **Run Restore**: `pg_restore` command above.
4. **Run Migrations**: `npm run db:migrate:deploy` to ensure schema consistency.
5. **Start Application**.

---

## 🧪 Testing Restores (Mandatory)

**Frequency**: Monthly or after major schema changes.

**Steps**:
1. Restore a Production backup to the **Staging** environment.
2. Run the application against the restored data.
3. Verify critical data paths:
   - Can user John Doe log in? (Password hash integrity)
   - Do tasks for user_001 exist? (Relation integrity)
   - Are the latest indexes working? (`EXPLAIN ANALYZE`)
4. Document the restore time (RTO) and data loss (RPO).

---

## 📌 Best Practices

1. **Automation**: Never rely on manual backups. Use Cron jobs or managed DB services.
2. **Off-site Storage**: Encrypt and store backups in a different region/provider (e.g., AWS S3 Glacier).
3. **Least Privilege**: Backup user should only have `SELECT` and `LOCK TABLES` permissions.
4. **Alerting**: Set up notifications for backup failures.
5. **Encryption**: Backups at rest must be encrypted (typically handled by cloud provider).

---

## 🚨 Emergency Contacts
- DB Admin: dev@example.com
- Security: sec@example.com
