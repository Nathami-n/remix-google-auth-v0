
/** 
 * A redirect utility function to mimick the behavior of the default remix redirect function
 * @param url - string url to redirect to
 * @param init - the Response init object that has the response text and response status
 * @returns Response
 */

export function redirect(url: string, init: ResponseInit | number = 302): Response {
    const responseInit: ResponseInit = typeof init === "number" ? {status: init} : {...init, status: init.status ?? 302}

    const headers = new Headers(responseInit.headers);
    headers.set("Location", url);

    return new Response(null, {...responseInit, headers});
}