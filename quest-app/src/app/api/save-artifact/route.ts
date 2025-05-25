import { NextResponse } from "next/server";
import { DynamoDBClient, PutItemCommand, PutItemCommandInput } from "@aws-sdk/client-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { ComponentData } from "@/lib/types";

// Configure AWS SDK
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

// Define TypeScript interface for artifact data
interface ArtifactData {
  id: string;
  name: string;
  artist?: string;
  date?: string;
  description: string;
  image: string;
  components: ComponentData[];
  createdAt: string;
}

export async function POST(request: Request) {
  try {
    const artifactData: ArtifactData = await request.json();

    if (!artifactData.name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Handle main artifact image upload if it's a base64 data URL
    let imageUrl = artifactData.image;
    if (typeof imageUrl === "string" && imageUrl.startsWith("data:image/")) {
      try {
        const matches = imageUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const contentType = matches[1];
          const base64Data = matches[2];
          const buffer = Buffer.from(base64Data, "base64");
          const timestamp = Date.now();
          const imageKey = `artifacts/${artifactData.id}/main-image-${timestamp}.jpg`;
          await s3.send(
            new PutObjectCommand({
              Bucket: process.env.AWS_BUCKET_NAME!,
              Key: imageKey,
              Body: buffer,
              ContentType: contentType,
            })
          );
          imageUrl = `/api/get-image?key=${encodeURIComponent(imageKey)}`;
        }
      } catch (err) {
        console.error("S3 upload failed for main artifact image:", err);
        imageUrl = "";
      }
    }

    // Find and upload images for image and restoration components in the components array
    const updatedComponents = await Promise.all(
      artifactData.components.map(async (component, index) => {
        // Handle image component
        if (
          component.type === "image" &&
          typeof component.content === "object" &&
          "url" in component.content &&
          component.content.url.startsWith("data:image/")
        ) {
          try {
            const matches = component.content.url.match(
              /^data:([A-Za-z-+/]+);base64,(.+)$/
            );
            if (matches && matches.length === 3) {
              const contentType = matches[1];
              const base64Data = matches[2];
              const buffer = Buffer.from(base64Data, "base64");
              const timestamp = Date.now();
              const imageKey = `artifacts/${artifactData.id}/component-${index}-${timestamp}.jpg`;
              await s3.send(
                new PutObjectCommand({
                  Bucket: process.env.AWS_BUCKET_NAME!,
                  Key: imageKey,
                  Body: buffer,
                  ContentType: contentType,
                })
              );
              return {
                ...component,
                content: {
                  ...component.content,
                  url: `/api/get-image?key=${encodeURIComponent(imageKey)}`,
                },
              };
            }
          } catch (err) {
            console.error("S3 upload failed for image component:", err);
          }
        }
        // Handle restoration component
        if (
          component.type === "restoration" &&
          typeof component.content === "object" &&
          "restorations" in component.content
        ) {
          try {
            const updatedRestorations = await Promise.all(
              (component.content.restorations as Array<any>).map(async (rest: any, rIndex: number) => {
                if (rest.imageUrl && rest.imageUrl.startsWith("data:image/")) {
                  const matches = rest.imageUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
                  if (matches && matches.length === 3) {
                    const contentType = matches[1];
                    const base64Data = matches[2];
                    const buffer = Buffer.from(base64Data, "base64");
                    const timestamp = Date.now();
                    const imageKey = `artifacts/${artifactData.id}/restoration-${index}-${rIndex}-${timestamp}.jpg`;
                    await s3.send(
                      new PutObjectCommand({
                        Bucket: process.env.AWS_BUCKET_NAME!,
                        Key: imageKey,
                        Body: buffer,
                        ContentType: contentType,
                      })
                    );
                    return {
                      ...rest,
                      imageUrl: `/api/get-image?key=${encodeURIComponent(imageKey)}`,
                    };
                  }
                }
                return rest;
              })
            );
            return {
              ...component,
              content: {
                ...component.content,
                restorations: updatedRestorations,
              },
            };
          } catch (err) {
            console.error("Failed to process restoration images:", err);
          }
        }
        return component;
      })
    );

    // Build DynamoDB item with correct image URL
    const params: PutItemCommandInput = {
      TableName: "artefacts",
      Item: {
        id: { S: artifactData.id },
        name: { S: artifactData.name },
        artist: artifactData.artist ? { S: artifactData.artist } : { NULL: true },
        date: artifactData.date ? { S: artifactData.date } : { NULL: true },
        description: { S: artifactData.description },
        image: { S: typeof imageUrl === "string" ? imageUrl : "" },
        components: { S: JSON.stringify(updatedComponents) },
        createdAt: { S: artifactData.createdAt },
      },
    };

    await dynamoDB.send(new PutItemCommand(params));

    return NextResponse.json({
      success: true,
      id: artifactData.id,
    });
  } catch (error) {
    console.error("DynamoDB Error:", error);
    return NextResponse.json(
      {
        error: "Failed to save artifact",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
