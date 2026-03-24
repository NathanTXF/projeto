const REQUEST_ID_HEADER = 'x-request-id';

export function resolveRequestId(headers: Headers): string {
    const incoming = headers.get(REQUEST_ID_HEADER);
    if (incoming && incoming.trim().length > 0) {
        return incoming;
    }
    return globalThis.crypto.randomUUID();
}

export function getRequestIdHeaderName(): string {
    return REQUEST_ID_HEADER;
}
