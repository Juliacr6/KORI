
const inputTelefono = document.getElementById('telefono');
const errorTelefono = document.getElementById('error-telefono');

// Solo permitir números y máximo 9 dígitos
inputTelefono.addEventListener('input', function() {
    this.value = this.value.replace(/[^0-9]/g, '');

    if (this.value.length > 9) {
        this.value = this.value.slice(0, 9);
    }

    // Quitar el error cuando tenga 9 números
    if (this.value.length === 9) {
        errorTelefono.textContent = '';
        this.classList.remove('is-invalid');
    }
});

// Validar al salir del campo
inputTelefono.addEventListener('blur', function() {
    if (this.value.length !== 9) {
        errorTelefono.textContent = 'El celular debe tener exactamente 9 números';
        this.classList.add('is-invalid');
    } else {
        errorTelefono.textContent = '';
        this.classList.remove('is-invalid');
    }
});


 // Calcular el total del pedido
const destino = document.getElementById('destino');
const subtotalPedido = document.getElementById('subtotal-pedido');
const costoEnvio = document.getElementById('costo-envio');
const totalPedido = document.getElementById('total-pedido');

function calcularTotal() {
    let subtotal = 0;

    try {
        subtotal = Number(localStorage.getItem('kori_total')) || 0;
    } catch (e) {
        subtotal = 0;
    }

    let envio = 0;

    if (destino.value === 'provincia') {
        envio = 15;
    }

    subtotalPedido.textContent = 'S/ ' + subtotal.toFixed(2);
    costoEnvio.textContent = 'S/ ' + envio.toFixed(2);
    totalPedido.textContent = 'S/ ' + (subtotal + envio).toFixed(2);
}

destino.addEventListener('change', calcularTotal);

calcularTotal();
