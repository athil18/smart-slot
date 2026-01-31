import { z } from 'zod';

export const rescheduleSchema = z.object({
    newDate: z.string().min(1, 'Date is required').refine(
        (date) => new Date(date) >= new Date(new Date().setHours(0, 0, 0, 0)),
        { message: 'Cannot reschedule to a past date' }
    ),
    newSlotId: z.string().min(1, 'Please select a time slot'),
});

export type RescheduleInput = z.infer<typeof rescheduleSchema>;
