import { Sequelize } from 'sequelize';
import logger from './logger';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined in environment variables');
}

export const sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    logging: (msg: string) => logger.info(msg),
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

export const connectDB = async (): Promise<void> => {
    try {
        await sequelize.authenticate();
        console.log('PostgreSQL Connected...');

        // Sync models
        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({ alter: true });
            console.log('Database synced');
        }
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};
