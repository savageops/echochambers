/**
 * Utility function for retrying operations with exponential backoff
 */
export async function withRetry<T>(
    operation: () => Promise<T>,
    options: {
        attempts?: number;
        delay?: number;
        onError?: (error: Error, attempt: number) => void;
    } = {}
): Promise<T> {
    const {
        attempts = 3,
        delay = 1000,
        onError
    } = options;

    let lastError: Error | undefined;

    for (let i = 0; i < attempts; i++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error as Error;
            
            if (onError) {
                onError(lastError, i + 1);
            }

            if (i < attempts - 1) {
                await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
            }
        }
    }

    throw lastError;
}

/**
 * Type guard to check if an error is a specific type
 */
export function isErrorType<T extends Error>(
    error: unknown,
    errorType: new (...args: any[]) => T
): error is T {
    return error instanceof errorType;
}

/**
 * Safely stringify data for logging
 */
export function safeStringify(data: any): string {
    try {
        return JSON.stringify(data, null, 2);
    } catch (error) {
        return `[Unable to stringify: ${error}]`;
    }
}

/**
 * Validate webhook URL
 */
export function isValidWebhookUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
}
