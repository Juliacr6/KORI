// Carrusel de merch en la página principal.
// Las flechas desplazan la fila hacia la izquierda o la derecha;
// también se puede arrastrar con el dedo o el mouse, o usar las flechas del teclado.
(function () {
    const pista = document.getElementById('carrusel-pista');
    const prev = document.getElementById('carrusel-prev');
    const next = document.getElementById('carrusel-next');
    if (!pista || !prev || !next) return;

    const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const paso = () => {
        const item = pista.querySelector('.carrusel-item');
        const gap = parseFloat(getComputedStyle(pista).columnGap) || 0;
        return item ? item.getBoundingClientRect().width + gap : pista.clientWidth * 0.8;
    };

    function mover(dir) {
        pista.scrollBy({ left: dir * paso(), behavior: reducir ? 'auto' : 'smooth' });
    }

    function estado() {
        const max = pista.scrollWidth - pista.clientWidth - 2;
        prev.disabled = pista.scrollLeft <= 2;
        next.disabled = pista.scrollLeft >= max;
        pista.classList.toggle('desv-izq', !prev.disabled);
        pista.classList.toggle('desv-der', !next.disabled);
    }

    prev.addEventListener('click', () => mover(-1));
    next.addEventListener('click', () => mover(1));
    pista.addEventListener('scroll', estado, { passive: true });
    window.addEventListener('resize', estado);
    window.addEventListener('load', estado);
    pista.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') { e.preventDefault(); mover(1); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); mover(-1); }
    });

    // Arrastrar con el mouse (en pantallas táctiles ya funciona con el dedo)
    let abajo = false, x0 = 0, s0 = 0, movido = false;
    pista.addEventListener('pointerdown', e => {
        if (e.pointerType !== 'mouse') return;
        abajo = true; movido = false; x0 = e.clientX; s0 = pista.scrollLeft;
    });
    window.addEventListener('pointermove', e => {
        if (!abajo) return;
        const dx = e.clientX - x0;
        if (Math.abs(dx) > 5) { movido = true; pista.classList.add('arrastrando'); }
        pista.scrollLeft = s0 - dx;
    });
    window.addEventListener('pointerup', () => { abajo = false; pista.classList.remove('arrastrando'); });
    pista.addEventListener('click', e => { if (movido) { e.preventDefault(); movido = false; } }, true);

    estado();
})();
