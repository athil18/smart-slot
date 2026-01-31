import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { User } from '../models';
import logger from '../utils/logger';

const generateTokens = (id: string) => {
    const accessToken = jwt.sign({ id }, process.env.JWT_SECRET as string, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY as any
    });
    const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET as string, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY as any
    });
    return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role } = req.body;
        const userExists = await User.findOne({ where: { email } });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ name, email, password, role });
        const { accessToken, refreshToken } = generateTokens(user.id);

        user.refreshTokens = [...user.refreshTokens, refreshToken];
        await user.save();

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(201).json({
            accessToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

        logger.info(`User registered: ${user.email}`);
    } catch (error: any) {
        logger.error(`Registration Error: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (user && (await user.matchPassword(password))) {
            const { accessToken, refreshToken } = generateTokens(user.id);

            user.refreshTokens = [...user.refreshTokens, refreshToken];
            await user.save();

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            res.json({
                accessToken,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
            logger.info(`User logged in: ${user.email}`);
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error: any) {
        logger.error(`Login Error: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

export const logout = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(204);

    const user = await User.findOne({
        where: {
            refreshTokens: { [Op.contains]: [refreshToken] }
        }
    });

    if (user) {
        user.refreshTokens = user.refreshTokens.filter(rt => rt !== refreshToken);
        await user.save();
    }

    res.clearCookie('refreshToken');
    res.sendStatus(204);
};

export const refresh = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token not found' });

    const user = await User.findOne({
        where: {
            refreshTokens: { [Op.contains]: [refreshToken] }
        }
    });

    if (!user) return res.status(403).json({ message: 'Invalid refresh token' });

    try {
        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string);
        const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY as any
        });
        res.json({ accessToken });
    } catch (error) {
        res.status(403).json({ message: 'Expired refresh token' });
    }
};
