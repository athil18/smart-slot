import { Request, Response } from 'express';
import { Resource } from '../models';

export const createResource = async (req: Request, res: Response) => {
    try {
        const { name, type, capacity } = req.body;
        const resource = await Resource.create({ name, type, capacity });
        res.status(201).json(resource);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getResources = async (req: Request, res: Response) => {
    try {
        const resources = await Resource.findAll();
        res.json(resources);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateResource = async (req: Request, res: Response) => {
    try {
        const resource = await Resource.findByPk(req.params.id as string);
        if (!resource) return res.status(404).json({ message: 'Resource not found' });

        await resource.update(req.body);
        res.json(resource);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteResource = async (req: Request, res: Response) => {
    try {
        const resource = await Resource.findByPk(req.params.id as string);
        if (!resource) return res.status(404).json({ message: 'Resource not found' });

        await resource.destroy();
        res.json({ message: 'Resource removed' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
