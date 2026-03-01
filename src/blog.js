// ============================================================
//  blog.js — Fresqo Blog
//  Supabase REST API + Vanilla JS ES6+
// ============================================================

// ──────────────────────────────────────────────────────────
//  🔧 CONFIGURACIÓN — Rellena con tus credenciales Supabase
//  Settings → API en tu dashboard de Supabase
// ──────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://TU-PROYECTO.supabase.co';  // ← reemplaza
const SUPABASE_KEY = 'TU_ANON_PUBLIC_KEY';               // ← reemplaza
const TABLA = 'yeuspohc_blog';
const LIMIT_BLOG = 12;   // artículos por página en blog.html
const LIMIT_PREVIEW = 3;    // artículos en la preview del index

// ──────────────────────────────────────────────────────────
//  Mock data (se usa si las credenciales son placeholder)
// ──────────────────────────────────────────────────────────
const MOCK_ARTICLES = [
    {
        slug: 'beneficios-brocoli',
        title: 'Los increíbles beneficios del brócoli para tu salud',
        content: 'El brócoli es una de las verduras más nutritivas que existen. Rico en vitamina C, K, fibra y antioxidantes, este superalimento puede reducir el riesgo de enfermedades crónicas, mejorar la digestión y fortalecer el sistema inmune. Incluirlo en tu dieta diaria es una de las mejores decisiones que puedes tomar para tu bienestar a largo plazo.',
        author: 'Fresqo',
        image_url: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=600&q=80',
        category: 'Nutrición',
    },
    {
        slug: 'proteinas-vegetales',
        title: 'Proteínas vegetales: todo lo que necesitas saber',
        content: 'Muchas personas creen que solo la carne provee proteínas completas, pero la realidad es que combinando legumbres, granos y vegetales puedes obtener todos los aminoácidos esenciales. Descubre las mejores fuentes vegetales de proteína y cómo incorporarlas en tu plan alimenticio.',
        author: 'Fresqo',
        image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
        category: 'Nutrición',
    },
    {
        slug: 'chop-suey-historia',
        title: 'Historia del Chop Suey: el plato que conquistó el mundo',
        content: 'El Chop Suey tiene sus raíces en la cocina cantonesa del sur de China, pero fue en Estados Unidos donde se popularizó masivamente. Su nombre significa "pedazos mezclados" y su versatilidad lo ha convertido en uno de los platos más adaptables de la cocina asiática.',
        author: 'Fresqo',
        image_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80',
        category: 'Recetas',
    },
    {
        slug: 'hidratacion-deporte',
        title: 'Hidratación y rendimiento deportivo: la guía definitiva',
        content: 'Una hidratación adecuada puede ser la diferencia entre un entrenamiento promedio y uno excepcional. Aprende cuándo, cuánto y qué beber antes, durante y después del ejercicio para maximizar tu rendimiento y recuperación muscular.',
        author: 'Fresqo',
        image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80',
        category: 'Deporte',
    },
    {
        slug: 'meal-prep-semana',
        title: 'Meal prep semanal: cocina en 2 horas y come saludable toda la semana',
        content: 'El meal prep o preparación de comidas en lote es la estrategia más efectiva para mantener una alimentación saludable sin importar lo ocupado que estés. Te enseñamos un método probado para cocinar de una sola vez y tener comidas listas para toda la semana.',
        author: 'Fresqo',
        image_url: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&q=80',
        category: 'Tips',
    },
    {
        slug: 'verduras-temporada',
        title: 'Verduras de temporada: por qué son más nutritivas y económicas',
        content: 'Comer verduras de temporada no solo es más económico, sino que también aporta mayores nutrientes ya que los vegetales se cosechan en su punto óptimo de madurez. Conoce cuáles son las mejores verduras según cada época del año en Colombia.',
        author: 'Fresqo',
        image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80',
        category: 'Nutrición',
    },
];

// ──────────────────────────────────────────────────────────
//  HELPERS
// ──────────────────────────────────────────────────────────

/** Detecta si las credenciales siguen siendo placeholder */
function isUsingMock() {
    return SUPABASE_URL.includes('TU-PROYECTO') || SUPABASE_KEY.includes('TU_ANON');
}

/**
 * Extrae el primer párrafo o trunca el content a N caracteres.
 * @param {string} text
 * @param {number} maxChars
 */
function truncate(text, maxChars = 140) {
    if (!text) return '';
    const plain = text.replace(/<[^>]+>/g, ''); // strip HTML si viene
    return plain.length > maxChars ? plain.slice(0, maxChars).trimEnd() + '…' : plain;
}

/** Formatea fecha ISO a "21 feb 2026" */
function formatDate(iso) {
    if (!iso) return '';
    try {
        return new Date(iso).toLocaleDateString('es-CO', {
            day: 'numeric', month: 'short', year: 'numeric',
        });
    } catch { return iso; }
}

/** Genera un color de badge por categoría */
function categoryClass(cat) {
    const map = {
        'Nutrición': 'bg-green-100 text-green-800',
        'Recetas': 'bg-amber-100 text-amber-800',
        'Deporte': 'bg-blue-100 text-blue-800',
        'Tips': 'bg-purple-100 text-purple-800',
    };
    return map[cat] || 'bg-green-100 text-green-800';
}

// ──────────────────────────────────────────────────────────
//  FETCH
// ──────────────────────────────────────────────────────────

/**
 * Obtiene artículos desde Supabase REST API.
 * @param {number} limit
 * @returns {Promise<Array>}
 */
async function fetchArticulos(limit = LIMIT_BLOG) {
    if (isUsingMock()) {
        // Simula latencia de red en desarrollo
        await new Promise((r) => setTimeout(r, 700));
        return MOCK_ARTICLES.slice(0, limit);
    }

    const url = `${SUPABASE_URL}/rest/v1/${TABLA}?select=*&order=id.desc&limit=${limit}`;
    const res = await fetch(url, {
        headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
        },
    });

    if (!res.ok) {
        throw new Error(`Supabase error ${res.status}: ${res.statusText}`);
    }
    return res.json();
}

// ──────────────────────────────────────────────────────────
//  RENDER — Skeleton
// ──────────────────────────────────────────────────────────

function renderSkeletons(container, count = 6) {
    container.innerHTML = Array.from({ length: count }, () => `
    <div class="bg-white rounded-3xl overflow-hidden shadow-sm border border-green-100 animate-pulse">
      <div class="h-48 bg-green-100"></div>
      <div class="p-5 space-y-3">
        <div class="h-3 bg-green-100 rounded w-1/4"></div>
        <div class="h-5 bg-green-100 rounded w-3/4"></div>
        <div class="h-3 bg-green-100 rounded w-full"></div>
        <div class="h-3 bg-green-100 rounded w-5/6"></div>
        <div class="h-3 bg-green-100 rounded w-1/3 mt-4"></div>
      </div>
    </div>
  `).join('');
}

// ──────────────────────────────────────────────────────────
//  RENDER — Card de artículo
// ──────────────────────────────────────────────────────────

function renderCard(article) {
    const cat = article.category || article.categoria || 'Nutrición';
    const fecha = formatDate(article.created_at || article.fecha);
    const img = article.image_url || 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80';
    const resumen = truncate(article.content, 130);

    return `
    <article
      class="blog-card bg-white rounded-3xl overflow-hidden shadow-sm border border-green-100 flex flex-col cursor-pointer group transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
      data-category="${cat}"
      data-slug="${article.slug || ''}"
      tabindex="0"
      role="button"
      aria-label="Leer artículo: ${article.title}"
    >
      <div class="relative h-48 overflow-hidden">
        <img
          src="${img}"
          alt="${article.title}"
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onerror="this.src='https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80'"
        />
        <span class="absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full ${categoryClass(cat)}">${cat}</span>
      </div>
      <div class="p-5 flex flex-col flex-1">
        <h3 class="font-bold text-green-900 text-base leading-snug mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
          ${article.title}
        </h3>
        <p class="text-green-700/70 text-sm leading-relaxed mb-4 flex-1">${resumen}</p>
        <div class="flex items-center justify-between mt-auto pt-3 border-t border-green-50">
          <span class="text-xs text-green-500 font-medium">${article.author || 'Fresqo'}</span>
          ${fecha ? `<span class="text-xs text-green-400">${fecha}</span>` : ''}
        </div>
      </div>
    </article>
  `;
}

// ──────────────────────────────────────────────────────────
//  MODAL — Leer artículo completo
// ──────────────────────────────────────────────────────────

function openModal(article) {
    const existing = document.getElementById('blog-modal');
    if (existing) existing.remove();

    const cat = article.category || article.categoria || 'Nutrición';
    const img = article.image_url || '';
    const fecha = formatDate(article.created_at || article.fecha);

    const modal = document.createElement('div');
    modal.id = 'blog-modal';
    modal.className = 'fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-10 px-4';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', article.title);

    modal.innerHTML = `
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" id="modal-backdrop"></div>
    <div class="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full z-10 overflow-hidden">
      ${img ? `<div class="h-64 overflow-hidden"><img src="${img}" alt="${article.title}" class="w-full h-full object-cover"/></div>` : ''}
      <div class="p-8">
        <div class="flex items-center gap-3 mb-4">
          <span class="text-xs font-semibold px-3 py-1 rounded-full ${categoryClass(cat)}">${cat}</span>
          ${fecha ? `<span class="text-xs text-green-400">${fecha}</span>` : ''}
        </div>
        <h2 class="text-2xl font-extrabold text-green-900 mb-4 leading-tight">${article.title}</h2>
        <div class="text-green-700/80 text-sm leading-relaxed space-y-3">
          ${article.content
            ? article.content.split('\n').filter(Boolean).map(p => `<p>${p}</p>`).join('')
            : '<p>Contenido no disponible.</p>'}
        </div>
        <div class="flex items-center justify-between mt-8 pt-5 border-t border-green-100">
          <span class="text-sm text-green-600 font-medium">✍️ ${article.author || 'Fresqo'}</span>
          <button
            id="modal-close"
            class="text-sm bg-green-800 text-white font-semibold px-5 py-2.5 rounded-full hover:bg-green-700 transition-colors cursor-pointer focus:outline-none focus:ring-4 focus:ring-green-300"
          >
            Cerrar ✕
          </button>
        </div>
      </div>
    </div>
  `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    const close = () => {
        modal.remove();
        document.body.style.overflow = '';
    };

    modal.querySelector('#modal-close').addEventListener('click', close);
    modal.querySelector('#modal-backdrop').addEventListener('click', close);
    document.addEventListener('keydown', function esc(e) {
        if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
    });
}

// ──────────────────────────────────────────────────────────
//  BLOG PAGE — Inicialización completa
// ──────────────────────────────────────────────────────────

async function initBlogPage() {
    const grid = document.getElementById('blog-grid');
    const filters = document.getElementById('blog-filters');
    const errorEl = document.getElementById('blog-error');
    const emptyEl = document.getElementById('blog-empty');
    if (!grid) return;

    // Skeleton
    renderSkeletons(grid, 6);

    let articles = [];
    try {
        articles = await fetchArticulos(LIMIT_BLOG);
    } catch (err) {
        console.error('Blog fetch error:', err);
        grid.innerHTML = '';
        if (errorEl) errorEl.classList.remove('hidden');
        return;
    }

    if (!articles.length) {
        grid.innerHTML = '';
        if (emptyEl) emptyEl.classList.remove('hidden');
        return;
    }

    // Avisa si está usando mock data
    if (isUsingMock()) {
        const banner = document.getElementById('mock-banner');
        if (banner) banner.classList.remove('hidden');
    }

    // Render inicial
    const renderGrid = (filtered) => {
        grid.innerHTML = filtered.length
            ? filtered.map(renderCard).join('')
            : `<p class="col-span-full text-center text-green-600 py-10">No hay artículos en esta categoría.</p>`;

        // Click en card → modal
        grid.querySelectorAll('.blog-card').forEach((card, i) => {
            const open = () => openModal(filtered[i]);
            card.addEventListener('click', open);
            card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') open(); });
        });
    };

    renderGrid(articles);

    // Filtros por categoría
    if (filters) {
        const categories = ['Todos', ...new Set(articles.map(a => a.category || a.categoria || 'Nutrición'))];
        filters.innerHTML = categories.map((cat, i) => `
      <button
        class="filter-btn ${i === 0 ? 'active bg-green-800 text-white' : 'bg-green-50 text-green-800 border border-green-200'} px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 hover:bg-green-700 hover:text-white focus:outline-none focus:ring-4 focus:ring-green-300 cursor-pointer"
        data-filter="${cat}"
      >${cat}</button>
    `).join('');

        filters.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                filters.querySelectorAll('.filter-btn').forEach(b => {
                    b.classList.remove('active', 'bg-green-800', 'text-white');
                    b.classList.add('bg-green-50', 'text-green-800', 'border', 'border-green-200');
                });
                btn.classList.add('active', 'bg-green-800', 'text-white');
                btn.classList.remove('bg-green-50', 'text-green-800', 'border', 'border-green-200');

                const f = btn.dataset.filter;
                const filtered = f === 'Todos' ? articles : articles.filter(a => (a.category || a.categoria) === f);
                renderGrid(filtered);
            });
        });
    }
}

// ──────────────────────────────────────────────────────────
//  INDEX PREVIEW — Últimas 3 noticias en index.html
// ──────────────────────────────────────────────────────────

async function initBlogPreview() {
    const previewGrid = document.getElementById('blog-preview-grid');
    if (!previewGrid) return;

    renderSkeletons(previewGrid, 3);

    try {
        const articles = await fetchArticulos(LIMIT_PREVIEW);
        if (!articles.length) {
            previewGrid.innerHTML = '<p class="col-span-full text-center text-green-600">Próximamente más contenido.</p>';
            return;
        }
        previewGrid.innerHTML = articles.map(renderCard).join('');
        previewGrid.querySelectorAll('.blog-card').forEach((card, i) => {
            const open = () => openModal(articles[i]);
            card.addEventListener('click', open);
            card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') open(); });
        });
    } catch (err) {
        previewGrid.innerHTML = '<p class="col-span-full text-center text-green-500 text-sm">No se pudo cargar el blog.</p>';
    }
}

// ──────────────────────────────────────────────────────────
//  BOOT
// ──────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    initBlogPage();
    initBlogPreview();
});

// Export para uso externo si necesario
export { fetchArticulos, SUPABASE_URL, SUPABASE_KEY, TABLA };
