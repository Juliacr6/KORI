// Contador del carrito en la barra de navegación (todas las páginas).
(function () {
    const badge = document.getElementById('carrito-contador');
    if (!badge) return;
    let anterior = 0;

    function cantidad() {
        try {
            const c = JSON.parse(localStorage.getItem('kori_carrito')) || [];
            return c.reduce((s, p) => s + p.cantidad, 0);
        } catch (e) { return 0; }
    }

    function actualizar() {
        const n = cantidad();
        badge.textContent = n;
        badge.hidden = n === 0;
        badge.parentElement.setAttribute('aria-label', n ? `Carrito de compras, ${n} productos` : 'Carrito de compras');
        if (n > anterior) {
            badge.classList.remove('bump');
            void badge.offsetWidth;          // reinicia la animación
            badge.classList.add('bump');
        }
        anterior = n;
    }

    window.addEventListener('kori:carrito', actualizar);
    window.addEventListener('storage', actualizar);
    window.addEventListener('pageshow', actualizar);
    actualizar();
})();
