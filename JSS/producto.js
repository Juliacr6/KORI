// ==========================================
// PÁGINA DE PRODUCTO - KORI STORE
// Color (solo polos y poleras), talla (solo polos y poleras) y cantidad.
// Añade al mismo carrito (localStorage) que usa carrito.html.
// ==========================================
(function () {
    const art = document.querySelector('.producto-detalle');
    if (!art) return;

    const base = art.dataset.nombre;
    const precio = parseFloat(art.dataset.precio);
    const esRopa = art.dataset.tipo === 'ropa';
    const foto = document.getElementById('foto-producto');
    const valor = document.getElementById('cant-valor');
    const boton = document.getElementById('btn-anadir-producto');
    let cantidad = 1;

    // Cantidad
    function pintarCantidad() {
        valor.textContent = cantidad;
        document.getElementById('cant-menos').disabled = cantidad <= 1;
        document.getElementById('cant-mas').disabled = cantidad >= 20;
    }
    document.getElementById('cant-menos').addEventListener('click', () => { if (cantidad > 1) { cantidad--; pintarCantidad(); } });
    document.getElementById('cant-mas').addEventListener('click', () => { if (cantidad < 20) { cantidad++; pintarCantidad(); } });
    pintarCantidad();

    // Color: muestra el nombre elegido, cambia la foto (data-img) y actualiza la nota
    document.querySelectorAll('input[name="color"]').forEach(r => {
        r.addEventListener('change', () => {
            document.getElementById('color-elegido').textContent = r.value;
            if (r.dataset.img && foto) foto.src = r.dataset.img;
            // NUEVO: actualiza el texto "Foto referencial en color ..."
            const nota = document.getElementById('nota-foto');
            if (nota) nota.textContent = `Foto referencial en color ${r.value.toLowerCase()}.`;
        });
    });
    document.querySelectorAll('input[name="talla"]').forEach(r => {
        r.addEventListener('change', () => { document.querySelector('.error-talla').textContent = ''; });
    });

    // Carrito
    let carrito = [];
    try { carrito = JSON.parse(localStorage.getItem('kori_carrito')) || []; } catch (e) { carrito = []; }

    function guardar() {
        const total = carrito.reduce((s, p) => s + p.precio * p.cantidad, 0);
        try {
            localStorage.setItem('kori_carrito', JSON.stringify(carrito));
            localStorage.setItem('kori_total', total.toFixed(2));
        } catch (e) { /* sin almacenamiento disponible */ }
        window.dispatchEvent(new Event('kori:carrito'));
    }

    let temporizador;
    function toast(texto) {
        let t = document.getElementById('toast-kori');
        if (!t) {
            t = document.createElement('div');
            t.id = 'toast-kori'; t.className = 'toast-kori'; t.setAttribute('role', 'status');
            document.body.appendChild(t);
        }
        t.innerHTML = '<span class="toast-kori-texto"></span>' +
            '<a href="carrito.html" class="toast-kori-enlace">Ver carrito <i class="bi bi-arrow-right" aria-hidden="true"></i></a>';
        t.querySelector('.toast-kori-texto').textContent = texto;
        t.classList.add('visible');
        clearTimeout(temporizador);
        temporizador = setTimeout(() => t.classList.remove('visible'), 3200);
    }

    boton.addEventListener('click', () => {
        // El carrito puede haber cambiado desde otra pestaña
        try { carrito = JSON.parse(localStorage.getItem('kori_carrito')) || []; } catch (e) { carrito = []; }
        let nombre = base;
        if (esRopa) {
            const talla = document.querySelector('input[name="talla"]:checked');
            if (!talla) {
                document.querySelector('.error-talla').textContent = 'Elige una talla antes de añadir.';
                document.querySelector('input[name="talla"]').focus();
                return;
            }
            const color = document.querySelector('input[name="color"]:checked');
            nombre += ` - Talla ${talla.value} - Color ${color ? color.value : 'Marrón'}`;
        }
        const imagen = foto ? foto.getAttribute('src') : null;
        const existente = carrito.find(i => i.nombre === nombre);
        if (existente) existente.cantidad += cantidad;
        else carrito.push({ nombre, precio, cantidad, imagen });
        guardar();
        toast(`${nombre} ×${cantidad} añadido`);

        boton.textContent = 'Añadido ✓';
        boton.classList.add('anadido');
        setTimeout(() => { boton.textContent = 'Añadir al carrito'; boton.classList.remove('anadido'); }, 1200);
    });
})();