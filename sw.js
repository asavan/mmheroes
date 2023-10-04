/* eslint-env serviceworker */
const version = "1.0.1";
const CACHE = "cache-only-" + version;

const toCache = [
    "./",
    "./index.html",
    "./manifest.json",
    "./512.png",
    "./favicon.ico",
    "./script.js",
    "./style.css"
];

const addResourcesToCache = async (resources) => {
    const cache = await caches.open(CACHE);
    await cache.addAll(resources);
};

function fromCache(request) {
    return caches.open(CACHE).
        then((cache) => cache.match(request, {ignoreSearch: true}).
            then((matching) => matching || Promise.reject(new Error("request-not-in-cache"))));
}

function networkOrCache(request) {
    return fetch(request).then((response) => response.ok ? response : fromCache(request)).
        catch(() => fromCache(request));
}

const deleteCache = async (key) => {
    await caches.delete(key);
};

const deleteOldCaches = async () => {
    const keyList = await caches.keys();
    const cachesToDelete = keyList.filter((key) => key !== CACHE);
    await Promise.all(cachesToDelete.map(deleteCache));
};

const onActivate = async () => {
    await self.clients.claim();
    await deleteOldCaches();
};

const onInstall = async () => {
    await addResourcesToCache(toCache);
    await self.skipWaiting();
};

self.oninstall = (evt) => evt.waitUntil(onInstall);

self.onactivate = (evt) => evt.waitUntil(onActivate());

self.onfetch = (evt) => evt.respondWith(networkOrCache(evt.request));
