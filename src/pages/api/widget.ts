import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  const prisma = new PrismaClient();

  if (req.method !== "GET") {
    return res.status(405).end(); // Method Not Allowed
  }

  const { id } = req.query; // Assume the workspace ID is passed as a query parameter

  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: String(id) },
    });

    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    // Add your own logic to handle public access to the workspace or restrict it based on request

    return res.status(200).json({ workspace });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
