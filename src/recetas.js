// ============================================================
//  recetas.js — Página de Recetas NutriPlan
//  Tabs interactivos + navbar scroll + menú móvil
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

    // ── TABS de recetas ──────────────────────────────────────
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.recipe-panel');

    tabBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;

            // Actualizar botones
            tabBtns.forEach((b) => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
                b.classList.add('border-green-200', 'text-green-800');
                b.classList.remove('border-green-800');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            btn.classList.remove('border-green-200', 'text-green-800');
            btn.classList.add('border-green-800');

            // Mostrar panel correspondiente
            tabPanels.forEach((panel) => {
                panel.classList.remove('active');
            });
            const activePanel = document.getElementById(`panel-${targetTab}`);
            if (activePanel) activePanel.classList.add('active');
        });
    });

    // ── NAVBAR scroll glassmorphism ──────────────────────────
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 40) {
                navbar.classList.add('shadow-lg');
            } else {
                navbar.classList.remove('shadow-lg');
            }
        });
    }

    // ── MENÚ MÓVIL ───────────────────────────────────────────
    const menuBtn = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            const isOpen = !mobileMenu.classList.contains('hidden');
            menuBtn.setAttribute('aria-expanded', String(isOpen));
        });
        // Cerrar menú al hacer clic en un link
        mobileMenu.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                menuBtn.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // ── ANIMACIONES scroll ───────────────────────────────────
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('opacity-100', 'translate-y-0');
                    entry.target.classList.remove('opacity-0', 'translate-y-6');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12 }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
        el.classList.add('opacity-0', 'translate-y-6', 'transition-all', 'duration-700', 'ease-out');
        observer.observe(el);
    });

});
