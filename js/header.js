document.addEventListener('DOMContentLoaded', async () => {
    const contenedor = document.getElementById('shared-header');

    if (!contenedor) return;

    try {
        const respuesta = await fetch('/templates/header.html');

        if (!respuesta.ok) {
            throw new Error('No se pudo cargar el encabezado');
        }

        contenedor.innerHTML = await respuesta.text();

        const contactBtn = document.getElementById('nav-contact-link');
        if (contactBtn) {
            contactBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = '/templates/error-404.html';
            });
        }

    } catch (error) {
        console.error('Error al cargar el encabezado:', error);
    }
});