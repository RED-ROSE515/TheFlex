import type { NextApiRequest, NextApiResponse } from "next";
import { fetchHostawayListings } from "@/lib/hostawayListings";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ status: string; result: any[] } | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const listings = await fetchHostawayListings();

    res.status(200).json({
      status: "success",
      result: listings,
    });
  } catch (error: any) {
    console.error("Error fetching listings:", error);
    const errorMessage = error?.message || "Internal server error";
    const statusCode = error?.response?.status || 500;
    res.status(statusCode).json({
      error: errorMessage,
      details: error?.response?.data || error?.stack,
    });
  }
}
