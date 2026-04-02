export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const { pathname, searchParams } = url;
        if (pathname === "/shortener") {
            return await createUrlMapping(searchParams.get("key"), searchParams.get("url"), url.origin, env);

        }
        const redirect = await getRedirect(pathname.slice(1), env);
        if (!redirect) {
            return new Response("Not Found", { status: 404 });
        }
        return Response.redirect(redirect, 302)
    }
};

export async function createUrlMapping(short, redirect, url, env) {
    if (await getRedirect(short, env)) {
        return new Response("Key already exists", {status: 400});
    }
    if (!short) {
        short = "";
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
        const random = crypto.getRandomValues(new Uint8Array(7));
        for (let i = 0; i < random.length; i++) {
            short += chars[random[i] % chars.length];
        }
    }
    await env.URLS.put(short, redirect);
    return new Response("Short URL: " + url + "/" + short, {status: 201})
}

export async function getRedirect(short, env) {
    return await env.URLS.get(short);
}