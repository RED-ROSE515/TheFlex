import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ success: boolean } | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { reviewId, listingName, approved } = req.body;

    if (typeof reviewId !== 'number' || typeof approved !== 'boolean') {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    await prisma.reviewApproval.upsert({
      where: { reviewId },
      update: { approved, listingName },
      create: {
        reviewId,
        listingName: listingName || 'Unknown',
        approved,
      },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating review approval:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

