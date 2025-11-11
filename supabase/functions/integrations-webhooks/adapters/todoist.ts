export interface TodoistPayload {
  event_name: string;
  event_data: {
    id: string;
    content: string;
    labels?: string[];
    completed_at?: string;
  };
  event_time?: string;
  user_id: string;
}

export interface CanonicalEvent {
  external_id: string;
  type: string;
  title: string;
  tags: string[];
  completed_at: string;
  provider_user_id: string;
}

export function getProviderUserId(payload: TodoistPayload): string {
  return payload.user_id?.toString() || '';
}

export function canonicalize(payload: TodoistPayload): CanonicalEvent | null {
  // Only process completed tasks
  if (payload.event_name !== 'item:completed') {
    return null;
  }

  const eventData = payload.event_data;
  
  return {
    external_id: eventData.id,
    type: 'task.completed',
    title: eventData.content || '',
    tags: eventData.labels || [],
    completed_at: eventData.completed_at || payload.event_time || new Date().toISOString(),
    provider_user_id: getProviderUserId(payload),
  };
}
