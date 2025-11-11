export interface StravaWebhookPayload {
  object_type: string;
  object_id: number;
  aspect_type: string;
  owner_id: number;
  subscription_id: number;
  event_time: number;
}

export interface CanonicalEvent {
  external_id: string;
  type: string;
  title: string;
  tags: string[];
  completed_at: string;
  provider_user_id: string;
}

export function getProviderUserId(payload: StravaWebhookPayload): string {
  return payload.owner_id?.toString() || '';
}

export async function canonicalize(
  payload: StravaWebhookPayload,
  accessToken: string
): Promise<CanonicalEvent | null> {
  // Only process activity events
  if (payload.object_type !== 'activity') {
    return null;
  }

  // Only process create and update events
  if (!['create', 'update'].includes(payload.aspect_type)) {
    return null;
  }

  const objectId = payload.object_id?.toString();
  
  // Fetch activity details from Strava API
  try {
    const activityResponse = await fetch(
      `https://www.strava.com/api/v3/activities/${objectId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!activityResponse.ok) {
      console.error('[Strava Adapter] Failed to fetch activity:', activityResponse.status);
      return null;
    }

    const activity = await activityResponse.json();

    // Determine event type
    const type = payload.aspect_type === 'create' ? 'activity.created' : 'activity.updated';

    // Use start_date_local as the completed_at time, or fall back to start_date
    const completedAt = activity.start_date_local || activity.start_date || new Date().toISOString();

    return {
      external_id: objectId,
      type: type,
      title: activity.name || 'Untitled Activity',
      tags: [activity.sport_type || activity.type || 'activity'],
      completed_at: completedAt,
      provider_user_id: getProviderUserId(payload),
    };
  } catch (error) {
    console.error('[Strava Adapter] Error fetching activity details:', error.message);
    return null;
  }
}
