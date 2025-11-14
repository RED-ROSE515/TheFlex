// In-memory store for review approvals
// Note: This resets on each server restart/deployment
// For persistence, consider using Vercel KV, Upstash, or similar service

interface ReviewApproval {
  reviewId: number;
  listingName: string;
  approved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage
const approvals = new Map<number, ReviewApproval>();

// Simulate Prisma-like API for easy migration
export const reviewApproval = {
  findMany: async (options?: { where?: { approved?: boolean } }) => {
    let results = Array.from(approvals.values());
    
    if (options?.where?.approved !== undefined) {
      results = results.filter(a => a.approved === options.where!.approved);
    }
    
    return results;
  },
  
  upsert: async (params: {
    where: { reviewId: number };
    update: { approved: boolean; listingName?: string };
    create: { reviewId: number; listingName: string; approved: boolean };
  }) => {
    const existing = approvals.get(params.where.reviewId);
    const now = new Date();
    
    if (existing) {
      existing.approved = params.update.approved;
      if (params.update.listingName) {
        existing.listingName = params.update.listingName;
      }
      existing.updatedAt = now;
      approvals.set(params.where.reviewId, existing);
      return existing;
    } else {
      const newApproval: ReviewApproval = {
        reviewId: params.create.reviewId,
        listingName: params.create.listingName,
        approved: params.create.approved,
        createdAt: now,
        updatedAt: now,
      };
      approvals.set(params.where.reviewId, newApproval);
      return newApproval;
    }
  },
};

// Export empty object for compatibility (in case anything tries to use prisma directly)
export const prisma = {
  reviewApproval,
};
