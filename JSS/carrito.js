// ==========================================
// PÁGINA DE CARRITO - KORI STORE
// Cantidades, quitar, vaciar, impacto de la compra y método de pago.
// ==========================================

const FOTOS = {                       // por si un producto antiguo se guardó sin foto
    'Polera Oversize Hombre': 'IMG/POLERA HOMBRE.png',
    'Polera Oversize Mujer': 'IMG/POLERA MUJER.png',
    'Polo Casual Hombre': 'IMG/POLO HOMBRE.png',
    'Polo Casual Mujer': 'IMG/POLO MUJER.png',
    'Peluche Eco': 'IMG/PELUCHE.png',
    'Taza Eco': 'IMG/TAZA.png',
    'Gorra Kori': 'IMG/GORRA.png'
};

const DETALLE_PAGO = {
    yape: 'Pagas desde tu celular con Yape o Plin. En el siguiente paso nos indicas el número de operación.',
    transferencia: 'Haces la transferencia bancaria. En el siguiente paso nos indicas el número de operación.',
    efectivo: 'Pagas en efectivo cuando recibes tu pedido. No necesitas número de operación.'
};

const $ = id => document.getElementById(id);
const dinero = n => 'S/ ' + n.toFixed(2);

let carrito = [];
try { carrito = JSON.parse(localStorage.getItem('kori_carrito')) || []; } catch (e) { carrito = []; }

function guardar() {
    const total = carrito.reduce((s, p) => s + p.precio * p.cantidad, 0);
    try {
        if (carrito.length) {
            localStorage.setItem('kori_carrito', JSON.stringify(carrito));
            localStorage.setItem('kori_total', total.toFixed(2));
        } else {
            localStorage.removeItem('kori_carrito');
            localStorage.removeItem('kori_total');
        }
    } catch (e) { /* sin almacenamiento */ }
    window.dispatchEvent(new Event('kori:carrito'));
}

function fotoDe(p) {
    if (p.imagen) return p.imagen;
    const clave = Object.keys(FOTOS).find(k => p.nombre.startsWith(k));
    return clave ? FOTOS[clave] : null;
}

function escapar(t) {
    const d = document.createElement('div');
    d.textContent = t;
    return d.innerHTML;
}

// Número que "corre" hasta su nuevo valor
function animarNumero(el, hasta) {
    const desde = el._valor ?? 0;
    el._valor = hasta;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || desde === hasta) {
        el.textContent = dinero(hasta);
        return;
    }
    const inicio = performance.now();
    const duracion = 450;
    (function paso(t) {
        const k = Math.min(1, (t - inicio) / duracion);
        const e = 1 - Math.pow(1 - k, 3);
        el.textContent = dinero(desde + (hasta - desde) * e);
        if (k < 1) requestAnimationFrame(paso);
    })(inicio);
}

function filaHTML(p, i, entrada) {
    const foto = fotoDe(p);
    const img = foto
        ? `<img src="${escapar(foto)}" alt="" class="item-foto">`
        : `<div class="item-foto item-foto-vacia" aria-hidden="true"></div>`;
    return `
    <li class="item-carrito${entrada ? ' entrando' : ''}" data-nombre="${escapar(p.nombre)}"
        style="${entrada ? `animation-delay:${i * 70}ms` : ''}">
      ${img}
      <div class="item-info">
        <p class="item-nombre">${escapar(p.nombre)}</p>
        <p class="item-unidad">${dinero(p.precio)} c/u</p>
        <div class="stepper" role="group" aria-label="Cantidad de ${escapar(p.nombre)}">
          <button type="button" class="stepper-btn" data-accion="menos" aria-label="Quitar una unidad"><i class="bi bi-dash" aria-hidden="true"></i></button>
          <output class="stepper-valor" aria-live="polite">${p.cantidad}</output>
          <button type="button" class="stepper-btn" data-accion="mas" aria-label="Añadir una unidad"><i class="bi bi-plus" aria-hidden="true"></i></button>
        </div>
      </div>
      <div class="item-lado">
        <span class="item-subtotal">${dinero(p.precio * p.cantidad)}</span>
        <button type="button" class="item-quitar" data-accion="quitar" aria-label="Quitar ${escapar(p.nombre)} del carrito"><i class="bi bi-trash3" aria-hidden="true"></i></button>
      </div>
    </li>`;
}

function render(entrada) {
    $('lista-carrito').innerHTML = carrito.map((p, i) => filaHTML(p, i, entrada)).join('');
    resumen();
}

function resumen() {
    const vacio = carrito.length === 0;
    const total = carrito.reduce((s, p) => s + p.precio * p.cantidad, 0);
    const unidades = carrito.reduce((s, p) => s + p.cantidad, 0);

    $('carrito-vacio').classList.toggle('d-none', !vacio);
    $('carrito-contenido').classList.toggle('d-none', vacio);
    $('btn-vaciar').disabled = vacio;

    $('resumen-unidades').textContent = unidades === 1 ? '1 producto' : `${unidades} productos`;
    animarNumero($('resumen-total'), total);

    // A dónde va el dinero (20 % a cada causa; el resto sostiene el negocio)
    const r = total * 0.20, c = total * 0.20, m = total * 0.20;
    $('impacto-reforestacion').textContent = dinero(r);
    $('impacto-comunidades').textContent = dinero(c);
    $('impacto-monitoreo').textContent = dinero(m);

    $('aviso-carrito').textContent = vacio
        ? 'Tu carrito está vacío.'
        : `Tienes ${unidades} productos. Total: ${dinero(total)}`;
}

// ----- Acciones sobre cada producto -----
$('lista-carrito').addEventListener('click', e => {
    const boton = e.target.closest('[data-accion]');
    if (!boton) return;
    const fila = boton.closest('.item-carrito');
    const item = carrito.find(p => p.nombre === fila.dataset.nombre);
    if (!item) return;
    const accion = boton.dataset.accion;

    if (accion === 'mas' || (accion === 'menos' && item.cantidad > 1)) {
        item.cantidad += accion === 'mas' ? 1 : -1;
        guardar();
        const valor = fila.querySelector('.stepper-valor');
        valor.textContent = item.cantidad;
        valor.classList.remove('bump'); void valor.offsetWidth; valor.classList.add('bump');
        fila.querySelector('.item-subtotal').textContent = dinero(item.precio * item.cantidad);
        resumen();
        return;
    }

    // "quitar" o bajar de 1 a 0: la fila se desvanece y luego desaparece
    fila.classList.add('saliendo');
    const quitar = () => {
        carrito = carrito.filter(p => p !== item);
        guardar();
        render(false);
    };
    setTimeout(quitar, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 320);
});

// ----- Vaciar el carrito (con confirmación) -----
$('confirmarVaciar').addEventListener('click', () => {
    document.querySelectorAll('.item-carrito').forEach((f, i) => {
        f.style.transitionDelay = `${i * 50}ms`;
        f.classList.add('saliendo');
    });
    setTimeout(() => {
        carrito = [];
        guardar();
        render(false);
    }, 380 + carrito.length * 50);
});

// ----- Método de pago -----
const opciones = document.querySelectorAll('input[name="pago"]');
function mostrarPago(valor) {
    const det = $('detalle-pago');
    det.textContent = valor ? DETALLE_PAGO[valor] : 'Elige cómo quieres pagar.';
    det.classList.toggle('activo', !!valor);
    $('error-continuar').textContent = '';
}
opciones.forEach(o => o.addEventListener('change', () => {
    try { localStorage.setItem('kori_pago', o.value); } catch (e) { /* sin almacenamiento */ }
    mostrarPago(o.value);
}));

let pagoGuardado = null;
try { pagoGuardado = localStorage.getItem('kori_pago'); } catch (e) { /* sin almacenamiento */ }
const previo = [...opciones].find(o => o.value === pagoGuardado);
if (previo) previo.checked = true;
mostrarPago(previo ? previo.value : null);

// ----- Continuar a los datos de envío -----
$('btn-continuar').addEventListener('click', () => {
    const error = $('error-continuar');
    if (carrito.length === 0) { error.textContent = 'Tu carrito está vacío. Añade productos desde el catálogo.'; return; }
    if (!document.querySelector('input[name="pago"]:checked')) {
        error.textContent = 'Elige un método de pago para continuar.';
        document.querySelector('.pago-grupo').classList.add('sacudir');
        setTimeout(() => document.querySelector('.pago-grupo').classList.remove('sacudir'), 500);
        return;
    }
    location.href = 'pedidos.html';
});

render(true);
