// ============================================================
//  main.js — Fitness Nutrition Plans
//  Vanilla JS ES6+ | WhatsApp Integration
//  ⚡ Para migrar a Stripe/MercadoPago:
//     Reemplaza la propiedad `paymentUrl` de cada plan
//     con la URL del payment link correspondiente.
//     Si `paymentUrl` tiene valor, se usará en vez de WhatsApp.
// ============================================================

// ──────────────────────────────────────────────
// 1. CONFIGURACIÓN CENTRAL (editar aquí)
// ──────────────────────────────────────────────
const CONFIG = {
    whatsappNumber: '573001234567',   // ← cambia por tu número real (sin + ni espacios)
    whatsappDefaultMsg: 'Hola, me interesa un plan alimenticio 🥗',
};

/** @type {Record<string, { label: string; msg: string; paymentUrl: string|null }>} */
const PLANS = {
    esencial: {
        label: 'Plan Esencial',
        msg: 'Hola! Me interesa el *Plan Esencial* 📦 ¿podrías darme más información?',
        paymentUrl: null,
    },
    familiar: {
        label: 'Plan Familiar',
        msg: 'Hola! Me interesa el *Plan Familiar* 👨‍👩‍👧‍👦 ¿podrías darme más información?',
        paymentUrl: null,
    },
    premium: {
        label: 'Plan Premium',
        msg: 'Hola! Me interesa el *Plan Premium* 🏆 ¿podrías darme más información?',
        paymentUrl: null,
    },
};

// ──────────────────────────────────────────────
// 2. STATE & HELPERS
// ──────────────────────────────────────────────

let currentFrequency = 'monthly'; // 'weekly' | 'monthly'

/**
 * Actualiza los precios en la interfaz según la frecuencia seleccionada.
 */
function updatePricingUI() {
    const isMonthly = currentFrequency === 'monthly';

    // Actualizar toggle visual
    const toggleDot = document.getElementById('toggle-dot');
    const labelSemanal = document.getElementById('label-semanal');
    const labelMensual = document.getElementById('label-mensual');

    if (toggleDot) {
        if (isMonthly) {
            toggleDot.classList.add('translate-x-8');
            toggleDot.classList.remove('translate-x-0.5'); // O el valor que tenga por defecto
        } else {
            toggleDot.classList.remove('translate-x-8');
            toggleDot.classList.add('translate-x-0.5');
        }
    }

    labelSemanal?.classList.toggle('text-green-900', !isMonthly);
    labelSemanal?.classList.toggle('text-green-700', isMonthly);
    labelMensual?.classList.toggle('text-green-900', isMonthly);
    labelMensual?.classList.toggle('text-green-700', !isMonthly);

    // Actualizar valores de precios principales
    document.querySelectorAll('.price-value').forEach(el => {
        const val = isMonthly ? el.dataset.monthly : el.dataset.weekly;
        if (val) el.textContent = val;
    });

    // Actualizar valores tachados originales (Valor Real)
    document.querySelectorAll('.original-price').forEach(el => {
        const val = isMonthly ? el.dataset.monthly : el.dataset.weekly;
        if (val) el.textContent = val;
    });

    // Actualizar montos de ahorro
    document.querySelectorAll('.savings-amount').forEach(el => {
        const val = isMonthly ? el.dataset.monthly : el.dataset.weekly;
        if (val) el.textContent = val;
    });

    // Actualizar etiquetas de periodo (/semana o /mes)
    document.querySelectorAll('.price-period').forEach(el => {
        el.textContent = isMonthly ? '/mes' : '/semana';
    });
}

/**
 * Construye la URL de WhatsApp con el mensaje codificado.
 */
function buildWhatsAppUrl(phone, message) {
    const freqLabel = currentFrequency === 'monthly' ? '(Mensual)' : '(Semanal)';
    const finalMsg = `${message} [Suscripción: ${freqLabel}]`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(finalMsg)}`;
}

/**
 * Maneja el clic en un botón de plan.
 */
function handlePlanClick(planKey) {
    const plan = PLANS[planKey];
    if (!plan) {
        console.warn(`Plan no encontrado: ${planKey}`);
        return;
    }

    const url = plan.paymentUrl
        ? plan.paymentUrl
        : buildWhatsAppUrl(CONFIG.whatsappNumber, plan.msg);

    window.open(url, '_blank', 'noopener,noreferrer');
}

// ──────────────────────────────────────────────
// 3. INICIALIZACIÓN — Event Delegation
// ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

    // Toggle de Precios
    const pricingToggle = document.getElementById('pricing-toggle');
    if (pricingToggle) {
        pricingToggle.addEventListener('click', () => {
            currentFrequency = currentFrequency === 'monthly' ? 'weekly' : 'monthly';
            updatePricingUI();
        });
    }

    // Botones de plan
    document.querySelectorAll('[data-plan]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const planKey = btn.dataset.plan;
            handlePlanClick(planKey);
        });
    });

    // Botón hero "Empieza Ahora"
    const heroBtn = document.getElementById('hero-cta');
    if (heroBtn) {
        heroBtn.addEventListener('click', () => {
            document.getElementById('planes')?.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 40) {
                navbar.classList.add('shadow-lg', 'backdrop-blur-md', 'bg-green-900/90');
                navbar.classList.remove('bg-transparent');
            } else {
                navbar.classList.remove('shadow-lg', 'backdrop-blur-md', 'bg-green-900/90');
                navbar.classList.add('bg-transparent');
            }
        });
    }

    // Menú móvil toggle
    const menuBtn = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Evitar que burbujee al document
            mobileMenu.classList.toggle('hidden');
            const isOpen = !mobileMenu.classList.contains('hidden');
            menuBtn.setAttribute('aria-expanded', String(isOpen));
        });

        // Cerrar al hacer click en un enlace del menú
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                menuBtn.setAttribute('aria-expanded', 'false');
            });
        });

        // Cerrar al tocar en cualquier otro lado de la pantalla
        document.addEventListener('click', (e) => {
            if (!mobileMenu.classList.contains('hidden') && !mobileMenu.contains(e.target) && !menuBtn.contains(e.target)) {
                mobileMenu.classList.add('hidden');
                menuBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Animación con IntersectionObserver
    const observerOptions = { threshold: 0.15 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('opacity-100', 'translate-y-0');
                entry.target.classList.remove('opacity-0', 'translate-y-8');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
        el.classList.add('opacity-0', 'translate-y-8', 'transition-all', 'duration-700', 'ease-out');
        observer.observe(el);
    });

});
