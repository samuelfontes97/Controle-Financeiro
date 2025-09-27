// --- 1. CONFIGURAÇÃO DO CACHE ---
// É uma boa prática incluir a versão no nome. Se você mudar algo, pode alterar para 'v2'.
const CACHE_NAME = 'controle-financeiro-v1';

// AJUSTE: Adicionamos a URL da biblioteca jsPDF à lista de arquivos para cache.
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];


// --- 2. INSTALAÇÃO DO SERVICE WORKER ---
// Este evento é disparado quando o service worker é instalado pela primeira vez.
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache aberto e arquivos sendo armazenados.');
                return cache.addAll(urlsToCache);
            })
    );
});


// --- 3. ESTRATÉGIA DE CACHE (FETCH) ---
// Intercepta todas as requisições de rede.
self.addEventListener('fetch', event => {
    event.respondWith(
        // Tenta encontrar a requisição no cache.
        caches.match(event.request)
            .then(response => {
                // Se encontrar uma resposta no cache, a retorna.
                // Se não, busca na rede (e o usuário verá um erro se estiver offline e o recurso não estiver no cache).
                return response || fetch(event.request);
            })
    );
});


// --- 4. ATIVAÇÃO E LIMPEZA DE CACHES ANTIGOS (BOA PRÁTICA) ---
// Este evento é disparado quando o novo service worker é ativado.
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME]; // Lista de caches que queremos manter.

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Se o nome do cache não estiver na nossa lista de permissões, ele é excluído.
                    // Isso é útil quando você atualiza o CACHE_NAME para uma 'v2' e quer apagar a 'v1'.
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Deletando cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
