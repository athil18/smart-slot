import { MongoClient } from 'mongodb';
import { prisma } from '../src/lib/prisma';
import { hashPassword } from '../src/lib/password';
import { logger } from '../src/lib/logger';

async function migrate() {
    const MONGO_URI = process.env['MONGO_MIGRATE_URI'];
    if (!MONGO_URI) {
        logger.error('❌ MONGO_MIGRATE_URI env var is required.');
        process.exit(1);
    }

    logger.info('🚀 Starting MongoDB to PostgreSQL Migration...');
    const mongoClient = new MongoClient(MONGO_URI);

    try {
        await mongoClient.connect();
        const db = mongoClient.db(); // Uses DB name from URI

        // --- 1. Migrate Users ---
        logger.info('📦 Migrating Users...');
        const mongoUsers = await db.collection('users').find().toArray();
        const userIdMap = new Map<string, string>(); // Mongo ID -> SQL ID

        for (const mUser of mongoUsers) {
            if (!mUser['email']) continue;

            // Ensure password exists or set a temporary one requiring reset
            const password = mUser['password'] || (await hashPassword('temp-migration-pass-123'));

            // Upsert to avoid duplicates
            const sqlUser = await prisma.user.upsert({
                where: { email: mUser['email'] },
                update: {},
                create: {
                    email: mUser['email'],
                    password: password,
                    name: mUser['name'],
                    createdAt: mUser['createdAt'] ? new Date(mUser['createdAt']) : undefined,
                },
            });

            userIdMap.set(mUser['_id'].toString(), sqlUser.id);
        }
        logger.info(`✅ Migrated ${mongoUsers.length} users.`);

        // --- 2. Migrate Tasks ---
        logger.info('📦 Migrating Tasks...');
        const mongoTasks = await db.collection('tasks').find().toArray();
        let tasksCreated = 0;

        for (const mTask of mongoTasks) {
            const sqlUserId = userIdMap.get(mTask['userId']?.toString());

            // Skip tasks linked to users that don't exist
            if (!sqlUserId) {
                logger.warn(`⚠️ Skipped task ${mTask['_id']} (User not found)`);
                continue;
            }

            await prisma.task.create({
                data: {
                    title: mTask['title'] || 'Untitled Task',
                    description: mTask['description'],
                    status: mapStatus(mTask['status']),
                    userId: sqlUserId,
                    createdAt: mTask['createdAt'] ? new Date(mTask['createdAt']) : undefined,
                },
            });
            tasksCreated++;
        }
        logger.info(`✅ Migrated ${tasksCreated} tasks.`);

    } catch (error) {
        logger.error({ error }, '❌ Migration failed');
        process.exit(1);
    } finally {
        await mongoClient.close();
        await prisma.$disconnect();
    }
}

function mapStatus(status: string): 'draft' | 'active' | 'completed' {
    switch (status?.toLowerCase()) {
        case 'done':
        case 'complete':
            return 'completed';
        case 'in-progress':
        case 'active':
            return 'active';
        default:
            return 'draft';
    }
}

migrate();
