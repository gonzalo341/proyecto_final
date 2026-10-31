document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.report-form');
    const categoryBtns = document.querySelectorAll('.category-btn');
    const fileInput = document.getElementById('photo-evidence');
    const filePreview = document.getElementById('filePreview');
    const previewImage = document.getElementById('previewImage');
    const fileName = document.getElementById('fileName');
    const fileStatus = document.getElementById('fileStatus');
    const removeFileBtn = document.getElementById('removeFileBtn');
    const charCounter = document.getElementById('charCounter');
    const detailsArea = document.getElementById('additional-details');

    if (!form) return;

    let selectedTipoId = 1;

    // 1. Contador de caracteres para detalles adicionales
    if (detailsArea && charCounter) {
        detailsArea.addEventListener('input', () => {
            charCounter.textContent = `${detailsArea.value.length}/240`;
        });
    }

    // 2. Selección de categorías
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedTipoId = Number(btn.getAttribute('data-tipo-id')) || 1;
        });
    });

    // 3. Previsualización de la imagen cargada
    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (!file) return;

        const sizeFormatted = file.size >= 1024 * 1024 
            ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
            : (file.size / 1024).toFixed(0) + ' KB';

        fileName.textContent = file.name;
        fileStatus.textContent = `${sizeFormatted} • Lista para envío`;

        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            filePreview.style.display = 'flex';
        };
        reader.readAsDataURL(file);
    });

    // 4. Quitar imagen seleccionada
    removeFileBtn.addEventListener('click', () => {
        fileInput.value = '';
        previewImage.src = '';
        filePreview.style.display = 'none';
    });

    // 5. Envío del formulario al backend Spring Boot
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const ubicacion = document.getElementById('incident-location').value.trim();
        const detalles = detailsArea ? detailsArea.value.trim() : '';

        if (!fileInput.files || fileInput.files.length === 0) {
            alert('Por favor, selecciona al menos una imagen de evidencia.');
            return;
        }

        // Obtener el usuario autenticado guardado al iniciar sesión
        const usernameLogueado = localStorage.getItem('username') 
            || sessionStorage.getItem('username') 
            || localStorage.getItem('user');

        if (!usernameLogueado) {
            alert('No se detectó una sesión activa. Por favor, inicia sesión para registrar un incidente.');
            window.location.href = '/templates/login.html';
            return;
        }

        const incidenteDTO = {
            descripcion: detalles,
            direccion: ubicacion,
            idTipo: selectedTipoId,
            idDepartamento: 1,
            idLocalidad: 41,
            idPrioridad: 2,
            username: usernameLogueado
        };

        const formData = new FormData();
        formData.append('incidente', new Blob([JSON.stringify(incidenteDTO)], {
            type: 'application/json'
        }));
        formData.append('images', fileInput.files[0]);

        // Token de sesión JWT (si aplica)
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

        try {
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('http://localhost:8080/api/incidentes', {
                method: 'POST',
                headers: headers,
                body: formData
            });

            if (response.ok) {
                alert('¡Incidente registrado exitosamente!');
                window.location.href = '/templates/active-incidents.html';
            } else {
                const errorData = await response.text();
                console.error('Error del servidor:', errorData);
                alert('Error al registrar el incidente: ' + errorData);
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            alert('No se pudo conectar con el servidor backend.');
        }
    });
});