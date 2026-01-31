import 'dotenv/config';
import { User } from './apps/backend/models';
import { sequelize } from './apps/backend/utils/db';

async function seedAdmin() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const adminEmail = 'admin@smartslot.com';
        const adminPassword = 'AdminPassword123!';

        const existingAdmin = await User.findOne({ where: { email: adminEmail } });
        if (existingAdmin) {
            console.log('Admin user already exists.');
        } else {
            await User.create({
                name: 'System Admin',
                email: adminEmail,
                password: adminPassword,
                role: 'admin'
            });
            console.log('Admin user created successfully.');
            console.log(`Email: ${adminEmail}`);
            console.log(`Password: ${adminPassword}`);
        }
    } catch (error) {
        console.error('Error seeding admin:', error);
    } finally {
        await sequelize.close();
    }
}

seedAdmin();
