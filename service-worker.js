// Nombre de la caché
const CACHE_NAME = 'financepro-cache-v1';

// Archivos a cachear
const urlsToCache = [
    '/FinancePRO/',
    '/FinancePRO/index.html',
    '/FinancePRO/manifest.json',
    '/FinancePRO/icons/icon-192x192.png',
    '/FinancePRO/icons/icon-512x512.png'
];

// Evento de instalación: cachea los archivos estáticos
self.addEventListener('install', (event) => {
    // waitUntil asegura que el Service Worker no se instale hasta que el trabajo dentro de él haya terminado.
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Cache abierta');
                // Añade todos los archivos a la caché.
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                // Si la instalación falla, es probable que la ruta de alguno de los archivos esté mal.
                console.error('Fallo al añadir archivos a la caché:', error);
            })
    );
});

// Evento de fetch: intercepta las peticiones y sirve archivos desde la caché
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Devuelve el archivo desde la caché si se encuentra
                if (response) {
                    return response;
                }
                // Si no se encuentra en la caché, realiza la petición de red
                return fetch(event.request);
            })
            .catch(() => {
                // Maneja los errores de conexión, por ejemplo, sirviendo una página offline
                // Aquí podrías servir una página predefinida para cuando no hay conexión.
                // Por simplicidad, no se incluye una página offline.
                console.error('Error de red al intentar servir el archivo.');
            })
    );
});

// Evento de activación: limpia las cachés antiguas
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        // Borra las cachés que no están en la lista blanca.
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
