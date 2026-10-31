const API_BASE_URL = 'http://localhost:8080';

// Cambia esta ruta por la de tu AuthController (ej: '/api/auth/login', '/api/login' o '/login')
const LOGIN_ENDPOINT = `/login`;

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initGeographicDropdowns();
    setupLoginForm();
    setupRegisterForm();
});

/* ==========================================================================
   1. CONTROL DE PESTAÑAS
   ========================================================================== */
function initTabs() {
    const loginOption = document.getElementById('login-option');
    const registerOption = document.getElementById('register-option');
    const loginContent = document.getElementById('login-content');
    const registerContent = document.getElementById('register-content');
    const linkToRegister = document.getElementById('link-to-register');

    if (!loginOption || !registerOption || !loginContent || !registerContent) return;

    const showLogin = () => {
        loginOption.className = 'tab-item option-active login-tab';
        loginContent.className = 'content content-active';
        registerOption.className = 'tab-item';
        registerContent.className = 'content';
        hideMessages();
    };

    const showRegister = () => {
        loginOption.className = 'tab-item';
        loginContent.className = 'content';
        registerOption.className = 'tab-item option-active register-tab';
        registerContent.className = 'content content-active';
        hideMessages();
    };

    loginOption.addEventListener('click', showLogin);
    registerOption.addEventListener('click', showRegister);

    if (linkToRegister) {
        linkToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            showRegister();
        });
    }
}

/* ==========================================================================
   2. DESPLEGABLES EN CASCADA
   ========================================================================== */
let provinciasData = [];
let localidadesData = [];

async function initGeographicDropdowns() {
    const provSelect = document.getElementById('idProvincia');
    const depSelect = document.getElementById('idDepartamento');
    const locSelect = document.getElementById('idLocalidad');

    if (!provSelect || !depSelect || !locSelect) return;

    try {
        const [provRes, locRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/provincias`),
            fetch(`${API_BASE_URL}/api/localidades`)
        ]);

        if (!provRes.ok || !locRes.ok) throw new Error('Error al obtener provincias/localidades.');

        provinciasData = await provRes.json();
        localidadesData = await locRes.json();

        provSelect.innerHTML = '<option value="">Seleccione una provincia...</option>';
        provinciasData.forEach(prov => {
            const option = document.createElement('option');
            option.value = prov.id;
            option.textContent = prov.nombre;
            provSelect.appendChild(option);
        });

    } catch (error) {
        console.error('Error cargando ubicaciones:', error);
    }

    provSelect.addEventListener('change', (e) => {
        const provId = Number(e.target.value);
        locSelect.innerHTML = '<option value="">Seleccione primero un departamento</option>';
        locSelect.disabled = true;

        if (!provId) {
            depSelect.innerHTML = '<option value="">Seleccione primero una provincia</option>';
            depSelect.disabled = true;
            return;
        }

        const provincia = provinciasData.find(p => p.id === provId);
        const departamentos = provincia ? provincia.departamentos : [];

        depSelect.innerHTML = '<option value="">Seleccione un departamento...</option>';
        departamentos.forEach(dep => {
            const option = document.createElement('option');
            option.value = dep.id;
            option.textContent = dep.nombre;
            depSelect.appendChild(option);
        });

        depSelect.disabled = false;
    });

    depSelect.addEventListener('change', (e) => {
        const depId = Number(e.target.value);

        if (!depId) {
            locSelect.innerHTML = '<option value="">Seleccione primero un departamento</option>';
            locSelect.disabled = true;
            return;
        }

        const localidadesFiltradas = localidadesData.filter(
            loc => loc.departamento && loc.departamento.id === depId
        );

        locSelect.innerHTML = '<option value="">Seleccione una localidad...</option>';
        localidadesFiltradas.forEach(loc => {
            const option = document.createElement('option');
            option.value = loc.id;
            option.textContent = loc.nombre;
            locSelect.appendChild(option);
        });

        locSelect.disabled = false;
    });
}

/* ==========================================================================
   3. INICIO DE SESIÓN (EMAIL Y CONTRASEÑA)
   ========================================================================== */
function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideMessages();

        const formData = new FormData(loginForm);
        const emailInput = formData.get('username')?.trim() || formData.get('email')?.trim();
        const passwordInput = formData.get('password');
        const rememberMe = formData.get('remember-me') !== null;

        // Estructura enviando correo y contraseña
        const payload = {
            email: emailInput,
            password: passwordInput
        };

        try {
            const response = await fetch(LOGIN_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || errorData.error || 'Correo o contraseña incorrectos.');
            }

            const data = await response.json().catch(() => ({}));

            const storage = rememberMe ? localStorage : sessionStorage;

            if (data.token) {
                storage.setItem('authToken', data.token);
            }

            // Guardar el identificador del usuario para asociarlo al registrar un incidente
            storage.setItem('username', data.username || data.email || emailInput);

            showLoginMessage('¡Inicio de sesión exitoso! Redirigiendo...', 'exito');

            setTimeout(() => {
                window.location.href = '/templates/report-incident.html';
            }, 1000);

        } catch (error) {
            showLoginMessage(error.message, 'error');
        }
    });
}

/* ==========================================================================
   4. REGISTRO DE USUARIO
   ========================================================================== */
function setupRegisterForm() {
    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideMessages();

        const formData = new FormData(registerForm);

        const payload = {
            username: formData.get('username')?.trim(),
            name: formData.get('name')?.trim(),
            lastname: formData.get('lastname')?.trim(),
            password: formData.get('password'),
            email: formData.get('email')?.trim(),
            dni: formData.get('dni')?.trim(),
            telefono: formData.get('telefono')?.trim(),
            direccion: formData.get('direccion')?.trim(),
            fechaNacimiento: formData.get('fechaNacimiento'),
            idProvincia: Number(formData.get('idProvincia')),
            idDepartamento: Number(formData.get('idDepartamento')),
            idLocalidad: Number(formData.get('idLocalidad'))
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.error) throw new Error(data.error);
                if (typeof data === 'object') {
                    const firstError = Object.values(data)[0];
                    throw new Error(firstError || 'Error al completar el registro.');
                }
                throw new Error('No se pudo completar el registro.');
            }

            showRegisterMessage('¡Registro completado con éxito! Ahora puedes iniciar sesión.', 'exito');
            registerForm.reset();

            setTimeout(() => {
                document.getElementById('login-option')?.click();
            }, 1500);

        } catch (error) {
            showRegisterMessage(error.message, 'error');
        }
    });
}

/* ==========================================================================
   MENSAJES DE FEEDBACK
   ========================================================================== */
function showLoginMessage(message, type) {
    const msgDiv = document.getElementById('login-message');
    if (!msgDiv) return;
    msgDiv.textContent = message;
    msgDiv.className = `login-mensaje ${type}`;
    msgDiv.removeAttribute('hidden');
}

function showRegisterMessage(message, type) {
    const msgDiv = document.getElementById('reg-error-message');
    if (!msgDiv) return;
    msgDiv.textContent = message;
    msgDiv.className = `login-mensaje ${type}`;
    msgDiv.removeAttribute('hidden');
}

function hideMessages() {
    const loginMsg = document.getElementById('login-message');
    const regMsg = document.getElementById('reg-error-message');
    if (loginMsg) loginMsg.setAttribute('hidden', 'true');
    if (regMsg) regMsg.setAttribute('hidden', 'true');
}