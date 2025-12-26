import 'dotenv/config';
import { PrismaClient } from '../generated/client/index.js';




console.log('DB URL:', process.env.DATABASE_URL);
const prisma = new PrismaClient();



export default prisma;

