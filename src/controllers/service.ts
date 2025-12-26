import { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { z } from 'zod';

const serviceSchema = z.object({
  name: z.string().min(2),
  price: z.number().positive(),
  duration: z.number().int().positive(), // in minutes
});

export const getServices = async (req: Request, res: Response) => {
  try {
    const services = await prisma.service.findMany();
    res.json(services);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createService = async (req: Request, res: Response) => {
  try {
    const data = serviceSchema.parse(req.body);
    const service = await prisma.service.create({ data });
    res.status(201).json(service);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = serviceSchema.partial().parse(req.body);
    const service = await prisma.service.update({ where: { id }, data });
    res.json(service);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.service.delete({ where: { id } });
    res.json({ message: 'Service deleted' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
