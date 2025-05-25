// app/api/save-quest/route.ts
import { NextResponse } from "next/server";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const dynamoDB = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

interface Quest {
  quest_id: string;
  title: string;
  description: string;
  artefacts: Array<{
    artefactId: string;
    hints: Array<{
      description: string;
      displayAfterAttempts: number;
    }>;
    hintDisplayMode: "sequential" | "random";
  }>;
  questType: "sequential" | "concurrent";
  dateRange?: {
    from: string;
    to: string;
  };
  prize?: {
    title: string;
    description: string;
    image?: string;
  };
  createdAt: string;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const questData: Omit<Quest, "quest_id" | "createdAt"> = JSON.parse(
      formData.get("quest") as string
    );
    const prizeImage = formData.get("prizeImage") as File | null;

    // Validate required fields
    if (!questData.title || !questData.description || questData.artefacts.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const questId = uuidv4();
    const timestamp = new Date().toISOString();

    // Handle prize image upload
    let updatedPrize = questData.prize;
    if (prizeImage) {
      if (!updatedPrize?.title || !updatedPrize?.description) {
        return NextResponse.json(
          { error: "Prize image provided but prize details are missing" },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await prizeImage.arrayBuffer());
      const fileExtension = prizeImage.name.split(".").pop();
      const imageKey = `quests/${questId}/prize-image-${uuidv4()}.${fileExtension}`;

      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME!,
          Key: imageKey,
          Body: buffer,
          ContentType: prizeImage.type,
        })
      );

      updatedPrize = {
        ...updatedPrize,
        image: `/api/get-image?key=${encodeURIComponent(imageKey)}`
      };
    }

    // Prepare complete quest object
    const quest: Quest = {
      quest_id: questId,
      ...questData,
      prize: updatedPrize,
      createdAt: timestamp,
    };

    // Prepare DynamoDB item
    const params = {
      TableName: "quests",
      Item: {
        quest_id: { S: quest.quest_id },
        title: { S: quest.title },
        description: { S: quest.description },
        artefacts: { S: JSON.stringify(quest.artefacts) },
        questType: { S: quest.questType },
        dateRange: quest.dateRange
          ? { S: JSON.stringify(quest.dateRange) }
          : { NULL: true },
        prize: quest.prize
          ? { S: JSON.stringify(quest.prize) }
          : { NULL: true },
        createdAt: { S: quest.createdAt },
      },
    };

    await dynamoDB.send(new PutItemCommand(params));

    return NextResponse.json({
      success: true,
      quest_id: questId,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        error: "Failed to save quest",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}