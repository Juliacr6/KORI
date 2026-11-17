// ==========================================
// PÁGINA PRINCIPAL: todo se "mezcla" mientras bajas.
// Cada elemento con data-mezcla aparece desde el desenfoque al entrar
// en pantalla y se disuelve suavemente al salir, así no hay cortes
// entre secciones. El fondo (aurora) se desplaza con el scroll.
// ==========================================
(function () {
    const elementos = [...document.querySelectorAll('[data-mezcla]')];
    const raiz = document.documentElement;
    const barra = document.getElementById('barra-progreso');
    const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducir || !elementos.length) {
        raiz.classList.add('sin-mezcla');
        return;
    }
    raiz.classList.add('mezcla-on');

    const limitar = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
    const suave = t => t * t * (3 - 2 * t);
    const inicio = performance.now();
    let pendiente = false;

    function dibujar(ahora) {
        pendiente = false;
        const vh = window.innerHeight;
        const y = window.scrollY;
        const total = Math.max(1, document.documentElement.scrollHeight - vh);
        const avance = limitar(y / total);

        raiz.style.setProperty('--avance', avance.toFixed(4));
        if (barra) barra.style.transform = `scaleX(${avance})`;

        const t = ahora - inicio;
        let animandoIntro = false;

        for (const el of elementos) {
            const orden = parseFloat(el.dataset.i || 0);
            const hero = el.dataset.mezcla === 'hero';
            const r = el.getBoundingClientRect();
            let aparece, sale, subida = 0;

            if (hero) {
                // Portada: entra sola al cargar y se funde con la sección siguiente al bajar
                const intro = limitar((t - 120 - orden * 110) / 900);
                if (intro < 1) animandoIntro = true;
                aparece = suave(intro);
                sale = suave(limitar((y - vh * 0.06) / (vh * 0.62)));
                subida = -y * (el.dataset.velocidad ? parseFloat(el.dataset.velocidad) : 0.18);
            } else {
                // Resto: entra al subir desde el borde inferior; se disuelve al irse por arriba
                const retraso = orden * 0.05 * vh;
                aparece = suave(limitar((vh * 0.98 - retraso - r.top) / (vh * 0.34)));
                sale = suave(limitar((vh * 0.20 - r.bottom) / (vh * 0.20)));
            }

            const visible = aparece * (1 - 0.92 * sale);
            const desenfoque = (1 - aparece) * 10 + sale * 6;
            const desplaza = (1 - aparece) * 30 + subida;
            const escala = 0.985 + 0.015 * aparece;

            el.style.opacity = visible.toFixed(3);
            el.style.transform = `translate3d(0, ${desplaza.toFixed(1)}px, 0) scale(${escala.toFixed(4)})`;
            el.style.filter = desenfoque > 0.15 ? `blur(${desenfoque.toFixed(1)}px)` : 'none';
        }

        if (animandoIntro) pedir();
    }

    function pedir() {
        if (!pendiente) { pendiente = true; requestAnimationFrame(dibujar); }
    }

    window.addEventListener('scroll', pedir, { passive: true });
    window.addEventListener('resize', pedir);
    window.addEventListener('load', pedir);
    pedir();
})();
