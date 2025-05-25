import { NextResponse } from 'next/server';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { getUrl } from '../utils/utils';

// Configure AWS SDK
const dynamoDB = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

function extractKeyFromProxyUrl(url: string): string | null {
  try {
    const parsed = new URL(url, 'http://localhost'); // Fallback base
    return parsed.pathname === '/api/get-image'
      ? decodeURIComponent(parsed.searchParams.get('key') || '')
      : null;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const params = {
      TableName: 'artefacts',
    };

    const result = await dynamoDB.send(new ScanCommand(params));
    const quests = await Promise.all(
      (result.Items ?? []).map(async (item) => {
        const prize = item.prize?.S ? JSON.parse(item.prize.S) : undefined;
        const imageKey = prize?.imageKey || extractKeyFromProxyUrl(prize?.image);

        const prizeImageUrl = imageKey
          ? await getUrl(imageKey)
          : null;

        if (prizeImageUrl) prize.image = prizeImageUrl;

        return {
          quest_id: item.quest_id.S,
          title: item.title.S,
          description: item.description.S,
          artefacts: JSON.parse(item.artefacts.S || '[]'),
          questType: item.questType.S,
          dateRange: item.dateRange?.S ? JSON.parse(item.dateRange.S) : undefined,
          prize,
          createdAt: item.createdAt.S,
        };
      })
    );

    return NextResponse.json({ quests });
  } catch (error) {
    console.error('Error fetching quests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quests' },
      { status: 500 }
    );
  }
}