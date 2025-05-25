// GET /api/user-quest-progress?questId=...
// Returns the user's progress for a quest
import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '../utils/utils';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand, UpdateCommandInput } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

interface UserQuestProgress {
  userId: string;
  questId: string;
  collectedArtefactIds: string[];
  completed: boolean;
  completedAt?: string;
  attempts: number;
  startTime?: string;
  endTime?: string;
  lastAttemptedArtefactId?: string;
  displayedHints: Record<string, boolean>;
}

export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  const questId = req.nextUrl.searchParams.get('questId');
  
  if (!userId || !questId) {
    return NextResponse.json({ error: 'Missing user or questId' }, { status: 400 });
  }

  const params = {
    TableName: process.env.USER_QUEST_PROGRESS_TABLE,
    Key: {
      userId,
      questId,
    }
  };

  try {
    const data = await docClient.send(new GetCommand(params));
    if (!data.Item) {
      return NextResponse.json({
        collectedArtefactIds: [],
        completed: false,
        attempts: 0,
        startTime: null,
        endTime: null,
        lastAttemptedArtefactId: null,
        displayedHints: {}
      });
    }

    const progress: UserQuestProgress = {
      userId: data.Item.userId,
      questId: data.Item.questId,
      collectedArtefactIds: data.Item.collectedArtefactIds || [],
      completed: data.Item.completed || false,
      completedAt: data.Item.completedAt || null,
      attempts: data.Item.attempts || 0,
      startTime: data.Item.startTime || null,
      endTime: data.Item.endTime || null,
      lastAttemptedArtefactId: data.Item.lastAttemptedArtefactId || null,
      displayedHints: data.Item.displayedHints || {}
    };

    return NextResponse.json(progress);
  } catch (e) {
    console.error('user-quest-progress error:', e);
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { questId, displayedHint, artefactId } = await req.json();
    if (!questId || (!displayedHint && !artefactId)) {
      return NextResponse.json({ error: 'Missing questId or update data' }, { status: 400 });
    }

    const getParams = {
      TableName: process.env.USER_QUEST_PROGRESS_TABLE,
      Key: {
        userId,
        questId
      }
    };

    // Get current state
    const currentState = await docClient.send(new GetCommand(getParams));
    if (!currentState.Item) {
      return NextResponse.json({ error: 'Quest progress not found' }, { status: 404 });
    }

    // Build update expression and values
    let updateExpr = 'SET';
    const exprValues: Record<string, number | string | Record<string, boolean>> = {};

    if (displayedHint) {
      updateExpr += ' displayedHints = :hints,';
      exprValues[':hints'] = {
        ...currentState.Item.displayedHints || {},
        ...displayedHint
      };
    }

    updateExpr += ' attempts = if_not_exists(attempts, :zero) + :one,';
    exprValues[':zero'] = 0;
    exprValues[':one'] = 1;

    if (!currentState.Item.startTime) {
      updateExpr += ' startTime = :now,';
      exprValues[':now'] = new Date().toISOString();
    }

    // Remove trailing comma
    updateExpr = updateExpr.replace(/,$/, '');

    const updateParams: UpdateCommandInput = {
      TableName: process.env.USER_QUEST_PROGRESS_TABLE,
      Key: {
        userId,
        questId
      },
      UpdateExpression: updateExpr,
      ExpressionAttributeValues: exprValues,
      ReturnValues: "ALL_NEW"
    };

    const result = await docClient.send(new UpdateCommand(updateParams));
    return NextResponse.json({ 
      success: true,
      progress: result.Attributes
    });
  } catch (e) {
    console.error('Error updating quest progress:', e);
    return NextResponse.json({ error: 'Failed to update quest progress' }, { status: 500 });
  }
}
