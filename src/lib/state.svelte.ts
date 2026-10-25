export type MessageType = 'greeting' | 'update' | 'generation' | 'security' | 'copy' | 'copyError';

export type TriggeredMessageType = 'generation' | 'security' | 'copy' | 'copyError';

export const currentState = $state({
	isInitialized: false,
	isUpdating: false,
	isReadyToUpdate: false,
	hasCheckedForUpdates: false,

	lastAction: null as TriggeredMessageType | null,
	lastMessage: null as string | null,
	messageVersion: 0
});

export function triggerMessage(type: TriggeredMessageType, message?: string) {
	currentState.lastAction = type;
	currentState.lastMessage = message ?? null;
	currentState.messageVersion += 1;
}
