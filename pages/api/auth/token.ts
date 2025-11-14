import type { NextApiRequest, NextApiResponse } from "next";
import { getAccessToken } from "@/lib/hostawayAuth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    { access_token: string } | { error: string; details?: string }
  >
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // This will get or refresh the token
    const accessToken = await getAccessToken();

    res.status(200).json({
      access_token: accessToken,
    });
  } catch (error: any) {
    console.error("Error getting access token:", error);
    const errorMessage = error?.response?.data
      ? JSON.stringify(error.response.data)
      : error?.message || "Unknown error";
    res.status(500).json({
      error: "Failed to get access token",
      details: errorMessage,
    });
  }
}
