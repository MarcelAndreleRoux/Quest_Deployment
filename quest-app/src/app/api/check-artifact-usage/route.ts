import { NextResponse } from "next/server";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";

const dynamoDB = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  const { artefactId } = await request.json();
  if (!artefactId) {
    return NextResponse.json({ error: "Missing artefactId" }, { status: 400 });
  }
  try {
    const data = await dynamoDB.send(
      new ScanCommand({ TableName: "quests" })
    );
    const usedIn: { id: string | undefined; title: string | undefined }[] = [];
    for (const item of data.Items || []) {
      const artefacts = item.artefacts?.S ? JSON.parse(item.artefacts.S) : [];
      if (artefacts.some((a: any) => a.artefactId === artefactId || a.id === artefactId)) {
        usedIn.push({ id: item.quest_id.S, title: item.title.S });
      }
    }
    return NextResponse.json({ usedIn });
  } catch (error) {
    return NextResponse.json({ error: "Failed to check usage" }, { status: 500 });
  }
}
