import { User } from './models';
import { sequelize } from './utils/db';
import 'dotenv/config';

async function seed() {
    try {
        await sequelize.authenticate();
        console.log('Admin Seeding: Connected.');

        const [admin, created] = await User.findOrCreate({
            where: { email: 'admin@smartslot.com' },
            defaults: {
                name: 'System Administrator',
                email: 'admin@smartslot.com',
                password: 'AdminPassword123!',
                role: 'admin'
            }
        });

        if (created) {
            console.log('✅ Created Admin Account: admin@smartslot.com / AdminPassword123!');
        } else {
            console.log('ℹ️ Admin Account already exists.');
        }
    } catch (err) {
        console.error('❌ Seeding failed:', err);
    } finally {
        process.exit();
    }
}

seed();
