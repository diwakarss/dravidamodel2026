function handler(event) {
    var request = event.request;
    var uri = request.uri;

    // Check for directory URI (ending in /)
    if (uri.endsWith('/')) {
        request.uri += 'index.html';
    }
    // Check for URI missing extension (likely a directory request without trailing slash)
    else if (!uri.includes('.')) {
        request.uri += '/index.html';
    }

    return request;
}
