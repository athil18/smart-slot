import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const hashPassword = async (pwd: string) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(pwd, salt);
};

const RESOURCES = [
    // Research
    { name: 'Chemistry Lab (Suite 101)', type: 'lab', capacity: 30 },
    { name: 'Bio-Safety Level 2 Lab', type: 'lab', capacity: 15 },
    { name: 'Physics & Mechanics Suite', type: 'lab', capacity: 20 },
    { name: '3D Printing Station', type: 'equipment', capacity: 5 },
    { name: 'Advanced Optics Lab', type: 'equipment', capacity: 8 },
    { name: 'HPC Computing Node', type: 'equipment', capacity: 50 },

    // Venture
    { name: 'Executive Boardroom', type: 'room', capacity: 12 },
    { name: 'VC Pitch Room', type: 'room', capacity: 8 },
    { name: 'Incubator Hot Desk A', type: 'room', capacity: 1 },
    { name: 'Podcast / AV Studio', type: 'studio', capacity: 6 },

    // Academic
    { name: 'Quiet Study Pod A', type: 'room', capacity: 4 },
    { name: 'Digital Library Lounge', type: 'room', capacity: 15 },
    { name: 'Cloud Computing Lab', type: 'lab', capacity: 25 },
    { name: 'Testing & Exam Center', type: 'room', capacity: 20 },

    // Public
    { name: 'Grand Conference Hall', type: 'room', capacity: 100 },
    { name: 'Press Briefing Room', type: 'room', capacity: 25 },
    { name: 'Secure Vault Room', type: 'room', capacity: 5 },

    // Wellness
    { name: 'Iron Hub Fitness Center', type: 'gym', capacity: 50 },
    { name: 'Zen Yoga Pavilion', type: 'room', capacity: 20 },
    { name: 'Hydrotherapy Suite', type: 'room', capacity: 4 },
    { name: 'Community Social Lounge', type: 'room', capacity: 30 },
];

const STAFF_NAMES = [
    'Mr. Walter White', // Chemistry
    'Ms. Frizzle',      // Science
    'Coach Carter',     // Gym
    'Tony Stark',       // Tech
    'Hermione Granger'  // Study Hall
];

async function main() {
    console.log('🌱 Seeding database with Student-Friendly data...');

    // Cleanup
    await prisma.appointment.deleteMany();
    await prisma.slot.deleteMany();
    await prisma.resource.deleteMany();
    await prisma.task.deleteMany();
    await prisma.user.deleteMany();

    const hashedPassword = await hashPassword('password123');

    // 1. Users
    console.log('Creating users...');

    // Admin
    await prisma.user.create({
        data: {
            id: 'u_admin',
            email: 'admin@school.edu',
            password: hashedPassword,
            name: 'Principal Fury',
            role: 'admin'
        }
    });

    // Staff
    const staffIds = [];
    for (let i = 0; i < STAFF_NAMES.length; i++) {
        const name = STAFF_NAMES[i] ?? 'Staff Member';
        const user = await prisma.user.create({
            data: {
                id: `u_staff_${i + 1}`,
                email: `staff${i + 1}@school.edu`,
                password: hashedPassword,
                name: name,
                role: 'staff'
            }
        });
        staffIds.push(user.id);
    }

    // Clients (renamed to students + new role users)
    const clientIds = [];

    // Students
    const STUDENT_NAMES = ['Peter Parker', 'Miles Morales', 'Kamala Khan', 'Gwen Stacy', 'Shuri'];
    for (let i = 0; i < STUDENT_NAMES.length; i++) {
        const name = STUDENT_NAMES[i] ?? 'Student';
        const user = await prisma.user.create({
            data: {
                id: `u_student_${i + 1}`,
                email: `student${i + 1}@school.edu`,
                password: hashedPassword,
                name: name,
                role: 'student',
                accessLevel: 1,
                organization: 'Midtown High School'
            }
        });
        clientIds.push(user.id);
    }

    // Scientists
    const SCIENTIST_NAMES = ['Dr. Bruce Banner', 'Dr. Jane Foster'];
    for (let i = 0; i < SCIENTIST_NAMES.length; i++) {
        const name = SCIENTIST_NAMES[i] ?? 'Scientist';
        await prisma.user.create({
            data: {
                id: `u_scientist_${i + 1}`,
                email: `scientist${i + 1}@lab.edu`,
                password: hashedPassword,
                name: name,
                role: 'scientist',
                accessLevel: 3,
                organization: 'Stark Industries R&D',
                department: 'Gamma Research'
            }
        });
    }

    // Entrepreneurs
    const ENTREPRENEUR_NAMES = ['Pepper Potts', 'T\'Challa'];
    for (let i = 0; i < ENTREPRENEUR_NAMES.length; i++) {
        const name = ENTREPRENEUR_NAMES[i] ?? 'Entrepreneur';
        await prisma.user.create({
            data: {
                id: `u_entrepreneur_${i + 1}`,
                email: `entrepreneur${i + 1}@startup.io`,
                password: hashedPassword,
                name: name,
                role: 'entrepreneur',
                accessLevel: 3,
                organization: i === 0 ? 'Stark Industries' : 'Wakanda Tech'
            }
        });
    }

    // Politicians
    await prisma.user.create({
        data: {
            id: 'u_politician_1',
            email: 'politician@gov.org',
            password: hashedPassword,
            name: 'Senator Ellis',
            role: 'politician',
            accessLevel: 4,
            organization: 'US Senate'
        }
    });

    // Retirees
    await prisma.user.create({
        data: {
            id: 'u_retiree_1',
            email: 'retiree@community.org',
            password: hashedPassword,
            name: 'Stan Lee',
            role: 'retiree',
            accessLevel: 1,
            organization: 'Community Center'
        }
    });

    // 2. Resources
    console.log('Creating resources...');
    const resourceIds = [];
    for (let i = 0; i < RESOURCES.length; i++) {
        const resData = RESOURCES[i]!;
        const res = await prisma.resource.create({
            data: {
                id: `res_${i + 1}`,
                name: resData.name,
                type: resData.type,
                capacity: resData.capacity
            }
        });
        resourceIds.push(res.id);
    }

    // 3. Slots & Appointments (Next 30 days)
    console.log('Generating Schedule...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 0; day < 30; day++) {
        const date = new Date(today);
        date.setDate(date.getDate() + day);

        // Skip weekends for some variety (0 = Sun, 6 = Sat)
        if (date.getDay() === 0 || date.getDay() === 6) continue;

        // For each staff member, create 2-4 slots per day
        for (const staffId of staffIds) {
            const numSlots = Math.floor(Math.random() * 3) + 2; // 2 to 4

            for (let s = 0; s < numSlots; s++) {
                const hour = 9 + s + Math.floor(Math.random() * 2); // 9am onwards, staggered
                const startTime = new Date(date);
                startTime.setHours(hour, 0, 0, 0);
                const endTime = new Date(startTime);
                endTime.setHours(hour + 1, 0, 0, 0);

                // Assign random resource
                const randomResId = resourceIds[Math.floor(Math.random() * resourceIds.length)];
                const resourceId = randomResId ?? null;

                // 40% chance of being booked
                const isBooked = Math.random() < 0.4;
                const status = isBooked ? 'booked' : 'available';

                const slot = await prisma.slot.create({
                    data: {
                        staffId,
                        resourceId,
                        startTime,
                        endTime,
                        status
                    }
                });

                if (isBooked) {
                    const clientId = clientIds[Math.floor(Math.random() * clientIds.length)]!;
                    await prisma.appointment.create({
                        data: {
                            clientId,
                            slotId: slot.id,
                            status: 'confirmed',
                            priority: Math.random() < 0.2 ? 'urgent' : 'normal',
                            notes: 'Study session / Experiment time.'
                        }
                    });
                }
            }
        }
    }

    // 4. Tasks (Admin Dashboard Data)
    console.log('Creating tasks...');
    await prisma.task.create({ data: { title: 'Review Safety Protocols', status: 'active', userId: 'u_admin' } });
    await prisma.task.create({ data: { title: 'Order 3D Filament', status: 'draft', userId: 'u_admin' } });
    await prisma.task.create({ data: { title: 'Schedule Parent Teacher Conf', status: 'completed', userId: 'u_admin' } });


    console.log('🚀 Seeding complete!');
    console.log(`- ${staffIds.length} Staff`);
    console.log(`- ${clientIds.length} Clients`);
    console.log(`- ${resourceIds.length} Resources`);
    console.log(`- Schedule generated for next 30 days`);

    console.log('\n📋 TEST CREDENTIALS (All passwords: password123):');
    console.log('┌───────────────────────────────┬────────────────┬──────────────┐');
    console.log('│ Email                         │ Role           │ Access Level │');
    console.log('├───────────────────────────────┼────────────────┼──────────────┤');
    console.log('│ admin@school.edu              │ 🔐 admin       │ 5            │');
    console.log('│ staff1@school.edu             │ 👨‍💼 staff        │ 2            │');
    console.log('│ student1@school.edu           │ 🎓 student     │ 1            │');
    console.log('│ scientist1@lab.edu            │ 🔬 scientist   │ 3            │');
    console.log('│ entrepreneur1@startup.io      │ 💼 entrepreneur│ 3            │');
    console.log('│ politician@gov.org            │ 🏛️ politician  │ 4            │');
    console.log('│ retiree@community.org         │ 👴 retiree     │ 1            │');
    console.log('└───────────────────────────────┴────────────────┴──────────────┘');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
