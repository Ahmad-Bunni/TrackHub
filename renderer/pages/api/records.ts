import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
const prisma = new PrismaClient();
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await prisma.record.create({ data: req.body });
    return res.status(200).json({
      message: `Created`,
    });
  } catch (error) {
    return res.status(400).json({
      error: `failed`,
    });
  }
};
export default handler;
