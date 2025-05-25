import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { getUserIdFromRequest } from '../utils/utils';

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.USER_QUEST_PROGRESS_TABLE;

export async function POST(req: NextRequest) {
  try {
    if (!TABLE_NAME) {
      return NextResponse.json({ error: 'USER_QUEST_PROGRESS_TABLE env var not set' }, { status: 500 });
    }
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { questId } = await req.json();
    if (!questId) {
      return NextResponse.json({ error: 'Missing questId' }, { status: 400 });
    }

    // Check if already started
    const getRes = await ddbDocClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { userId, questId },
    }));

    if (getRes.Item) {
      return NextResponse.json({ error: 'Quest already started' }, { status: 409 });
    }

    // Create new progress entry with initialized fields
    const startTime = new Date().toISOString();
    const newProgress = {
      userId,
      questId,
      status: 'in_progress',
      collectedArtefactIds: [],
      attempts: 0, // Initialize as single number
      displayedHints: {}, // Object to track displayed hints per artefact
      completed: false,
      startTime,
      endTime: null,
      lastAttemptedArtefactId: null
    };

    await ddbDocClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: newProgress,
    }));

    return NextResponse.json({ success: true, progress: newProgress });
  } catch (err: unknown) {
    console.error('Error in /api/start-quest:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}
