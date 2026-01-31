import type { Request, Response, NextFunction } from 'express';

/**
 * Role-based authorization middleware.
 * Must be used AFTER authMiddleware.
 * 
 * @example
 * router.get('/admin-only', authMiddleware, requireRole('admin'), handler);
 * router.get('/staff-or-admin', authMiddleware, requireRole('admin', 'staff'), handler);
 */
export function requireRole(...allowedRoles: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const userRole = req.user?.role;

        if (!userRole) {
            res.status(401).json({
                success: false,
                error: { message: 'Authentication required' },
            });
            return;
        }

        if (!allowedRoles.includes(userRole)) {
            res.status(403).json({
                success: false,
                error: { message: 'Insufficient permissions' },
            });
            return;
        }

        next();
    };
}
