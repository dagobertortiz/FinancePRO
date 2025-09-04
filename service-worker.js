// Nombre del caché
const CACHE_NAME = 'financepro-cache-v1';

// Archivos que se precachean
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css', // Si tuvieras un archivo de estilos separado
  '/app.js' // Si tuvieras tu lógica de JS en un archivo separado
];

// Instalar el Service Worker y almacenar los activos en caché
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activar el Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    // Eliminar cachés antiguos
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Eliminando caché antiguo', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptar las peticiones de red y servir desde el caché si están disponibles
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Devolver la respuesta desde el caché si se encuentra
        if (response) {
          return response;
        }

        // Si no está en el caché, realizar la petición a la red
        return fetch(event.request).then(
          response => {
            // Comprobar si recibimos una respuesta válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clonar la respuesta. Una respuesta es un stream y solo se puede consumir una vez
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});
