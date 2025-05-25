import { NextResponse } from 'next/server';
import { DynamoDBClient, ScanCommand, AttributeValue } from '@aws-sdk/client-dynamodb';
import { ComponentData } from '@/lib/types';

// Configure AWS SDK
const dynamoDB = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Define DynamoDB item structure
interface DynamoDBItem {
  id: AttributeValue;
  name: AttributeValue;
  artist?: AttributeValue;
  date?: AttributeValue;
  description: AttributeValue;
  image?: AttributeValue;
  components: AttributeValue;
  createdAt: AttributeValue;
  partOfQuest: AttributeValue;
}

// Helper to parse DynamoDB Items
function parseItem(item: DynamoDBItem) {
  const components: ComponentData[] = JSON.parse(item.components.S!);
  // Sort components by order property, fallback to array index if order is missing
  const sortedComponents = components.sort((a: ComponentData, b: ComponentData) => {
    const orderA = a.order !== undefined ? a.order : components.indexOf(a);
    const orderB = b.order !== undefined ? b.order : components.indexOf(b);
    return orderA - orderB;
  });
  return {
    id: item.id?.S ?? '',
    name: item.name?.S ?? '',
    artist: item.artist?.S ?? undefined,
    date: item.date?.S ?? undefined,
    description: item.description?.S ?? '',
    image: item.image?.S ?? '',
    components: sortedComponents,
    createdAt: item.createdAt?.S ?? '',
    partOfQuest: item.partOfQuest?.BOOL ?? false,
  };
}

export async function GET() {
  try {
    const params = {
      TableName: 'artefacts',
    };

    const data = await dynamoDB.send(new ScanCommand(params));
    const artifacts = data.Items?.map((item) => parseItem(item as unknown as DynamoDBItem)) || [];

    return NextResponse.json({ success: true, artifacts });
  } catch (error) {
    console.error('DynamoDB Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch artifacts',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}