document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.report-form');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        // 1. Evita que el HTML se envíe a Live Server y cause el error 405
        e.preventDefault();

        const ubicacion = document.getElementById('incident-location').value;
        const detalles = document.getElementById('additional-details').value;
        const fileInput = document.getElementById('photo-evidence');

        // Verificar que haya al menos una imagen seleccionada (requerido por el Controller)
        if (!fileInput.files || fileInput.files.length === 0) {
            alert('Por favor, selecciona al menos una imagen de evidencia.');
            return;
        }

        // 2. Construir objeto DTO
        const incidenteDTO = {
            descripcion: detalles,
            direccion: ubicacion,
            idTipoIncidente: 1, // ID correspondiente a tipo_incidente
            idLocalidad: 41,    // ID de la localidad
            idPrioridad: 2      // ID prioridad media
        };

        // 3. Crear FormData multipart
        const formData = new FormData();
        
        formData.append('incidente', new Blob([JSON.stringify(incidenteDTO)], {
            type: 'application/json'
        }));

        for (let i = 0; i < fileInput.files.length; i++) {
            formData.append('images', fileInput.files[i]);
        }

        try {
            // Petición POST directa al servidor de Spring Boot
            const response = await fetch('http://localhost:8080/api/incidentes', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                alert('¡Incidente registrado exitosamente en la base de datos!');
                window.location.href = '/templates/active-incidents.html';
            } else {
                const errorData = await response.text();
                console.error('Error del servidor:', errorData);
                alert('El servidor rechazó la solicitud. Revisa la consola.');
            }
        } catch (error) {
            console.error('Error de red al conectar con la API:', error);
            alert('No se pudo conectar con el servidor Spring Boot (http://localhost:8080).');
        }
    });
});