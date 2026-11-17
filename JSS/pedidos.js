// ==========================================
// CATÁLOGO - KORI STORE
// Añade productos al carrito. El carrito se guarda en el navegador
// (localStorage) y se ve y se gestiona en carrito.html.
// ==========================================

let carrito = [];
try { carrito = JSON.parse(localStorage.getItem('kori_carrito')) || []; } catch (e) { carrito = []; }

function guardarCarrito() {
    const total = carrito.reduce((s, p) => s + p.precio * p.cantidad, 0);
    try {
        localStorage.setItem('kori_carrito', JSON.stringify(carrito));
        localStorage.setItem('kori_total', total.toFixed(2));
    } catch (e) { /* sin almacenamiento disponible */ }
    window.dispatchEvent(new Event('kori:carrito'));   // avisa al contador de la barra
}

// Aviso flotante: "Añadido ... Ver carrito"
let temporizadorToast;
function mostrarToast(nombre) {
    let toast = document.getElementById('toast-kori');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-kori';
        toast.className = 'toast-kori';
        toast.setAttribute('role', 'status');
        document.body.appendChild(toast);
    }
    toast.innerHTML = '<span class="toast-kori-texto"></span>' +
        '<a href="carrito.html" class="toast-kori-enlace">Ver carrito <i class="bi bi-arrow-right" aria-hidden="true"></i></a>';
    toast.querySelector('.toast-kori-texto').textContent = `${nombre} añadido`;
    toast.classList.add('visible');
    clearTimeout(temporizadorToast);
    temporizadorToast = setTimeout(() => toast.classList.remove('visible'), 3200);
}

document.querySelectorAll('.btn-anadir').forEach(boton => {
    boton.addEventListener('click', () => {
        const article = boton.closest('.producto');
        let nombre = article.getAttribute('data-nombre');
        const precio = parseFloat(article.getAttribute('data-precio'));
        const foto = article.querySelector('.card-img-top');
        const imagen = foto && foto.tagName === 'IMG' ? foto.getAttribute('src') : null;

        // Poleras y polos: hay que elegir talla (el resto de productos no tiene selector)
        const grupoTalla = article.querySelector('.tallas');
        if (grupoTalla) {
            const elegida = grupoTalla.querySelector('input[type="radio"]:checked');
            const error = grupoTalla.querySelector('.error-talla');
            if (!elegida) {
                error.textContent = 'Elige una talla antes de añadir.';
                grupoTalla.querySelector('input[type="radio"]').focus();
                return;
            }
            error.textContent = '';
            nombre += ` - Talla ${elegida.value}`;
        }

        const existente = carrito.find(item => item.nombre === nombre);
        if (existente) {
            existente.cantidad += 1;
        } else {
            carrito.push({ nombre, precio, cantidad: 1, imagen });
        }
        guardarCarrito();
        mostrarToast(nombre);

        // Confirmación en el propio botón
        const original = boton.dataset.texto || boton.textContent;
        boton.dataset.texto = original;
        boton.textContent = 'Añadido ✓';
        boton.classList.add('anadido');
        setTimeout(() => { boton.textContent = original; boton.classList.remove('anadido'); }, 1200);
    });
});

// Al elegir una talla, se borra el aviso de error
document.querySelectorAll('.tallas input').forEach(radio => {
    radio.addEventListener('change', () => {
        radio.closest('.tallas').querySelector('.error-talla').textContent = '';
    });
});
