const loginOption = document.getElementById('login-option');
const registerOption = document.getElementById('register-option');
const loginContent = document.getElementById('login-content');
const registerContent = document.getElementById('register-content');

let activeOption = 1;

// Cambiar entre las pestañas
const changeActiveOption = () => {
    if (activeOption === 1) {
        loginOption.classList.value = 'tab-item option-active login-tab';
        loginContent.classList.value = 'content content-active';

        registerOption.classList.value = 'tab-item';
        registerContent.classList.value = 'content';
    } else {
        loginOption.classList.value = 'tab-item';
        loginContent.classList.value = 'content';

        registerOption.classList.value = 'tab-item option-active register-tab';
        registerContent.classList.value = 'content content-active';
    }
};

loginOption.addEventListener('click', () => {
    activeOption = 1;
    changeActiveOption();
});

registerOption.addEventListener('click', () => {
    activeOption = 2;
    changeActiveOption();
});

// ========================================
// INICIAR SESIÓN
// ========================================

const loginForm = loginContent.querySelector('form');
const mensajeLogin = document.getElementById('login-mensaje');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    mensajeLogin.hidden = true;
    mensajeLogin.textContent = '';
    mensajeLogin.className = 'login-mensaje';

    const boton = loginForm.querySelector('button[type="submit"]');
    boton.disabled = true;

    try {
        const formData = new FormData(loginForm);
        const loginData = {
            username: formData.get('username'),
            password: formData.get('password')
        };

        const respuesta = await fetch('http://localhost:8080/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(
                resultado.mensaje || 'No se pudo iniciar sesión.'
            );
        }

        if (resultado.jwt) {
            localStorage.setItem('token', resultado.jwt);
        }

        // Mostrar bienvenida con nombre y apellido
        mensajeLogin.textContent = resultado.mensaje || '¡Inicio de sesión exitoso!';
        mensajeLogin.classList.add('exito');
        mensajeLogin.hidden = false;

        // Ir a la página principal después de mostrar el mensaje
        setTimeout(() => {
            window.location.href = '/templates/active-incidents.html';
        }, 2000);

    } catch (error) {
        mensajeLogin.textContent =
            error.message || 'Ocurrió un error al iniciar sesión.';

        mensajeLogin.classList.add('error');
        mensajeLogin.hidden = false;

    } finally {
        boton.disabled = false;
    }
});

// ========================================
// REGISTRAR USUARIO
// ========================================

const registerForm = registerContent.querySelector('form');
const mensajeRegistro = document.getElementById('registro-mensaje');

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    mensajeRegistro.textContent = '';
    mensajeRegistro.style.color = '';

    const boton = registerForm.querySelector('button[type="submit"]');
    boton.disabled = true;

    try {
        const formData = new FormData(registerForm);
        const email = formData.get('email');
        const deptoId = Number(formData.get('department')) || 10;

        const datos = {
            username: email,
            name: formData.get('name'),
            lastname: formData.get('surname'),
            email: email,
            password: formData.get('password'),
            dni: formData.get('dni'),
            telefono: "2610000000",
            direccion: "Sin especificar",
            fechaNacimiento: "2000-01-01",
            idProvincia: 12,
            idDepartamento: deptoId,
            idLocalidad: 1
        };

        const respuesta = await fetch('http://localhost:8080/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        });

        const texto = await respuesta.text();
        let resultado;

        try {
            resultado = JSON.parse(texto);
        } catch {
            resultado = {
                mensaje: texto || 'No se pudo completar el registro.'
            };
        }

        if (!respuesta.ok) {
            throw new Error(
                resultado.mensaje || 'No se pudo completar el registro.'
            );
        }

        mensajeRegistro.textContent = resultado.mensaje || '¡Usuario registrado correctamente!';
        mensajeRegistro.style.color = 'green';

        registerForm.reset();

        setTimeout(() => {
            activeOption = 1;
            changeActiveOption();
            mensajeRegistro.textContent = '';
        }, 3000);

    } catch (error) {
        mensajeRegistro.textContent =
            error.message || 'Ocurrió un error al registrar el usuario.';

        mensajeRegistro.style.color = 'red';

    } finally {
        boton.disabled = false;
    }
});