let pagina = 1;
const cita = {
    nombre: '',
    fecha: '',
    hora: '',
    servicios: [],
}

document.addEventListener('DOMContentLoaded', function() {
    iniciarApp();
});

function iniciarApp() {
    mostrarServicios();

    //Resaltar el div actual segun el tab
    mostrarSeccion();

    //Ocultar o mostrar la seccion del tab
    cambiarSeccion();

    //Paginacion Siguiente y Anterior
    paginaSiguiente();
    paginaAnterior();

    //Comprueba la pagina actual para mostrar ocultar la paginacion
    botonesPaginador();

    //Muestra el resumen de la cita (o msj de error en caso de no pasar la validacion)
    mostrarResumen();

    // Almacena NombreCita
    nombreCita();

    //Almacena la fecha de la cita en el objeto
    fechaCita();

    //Desahabilitar dias pasados
    deshabilitarDiasAnteriores();

    //Almacenar la hora de la cita
    horaCita();
}

function mostrarSeccion() {
    //Eliminar mostrar-seccion de la seccion anterior
    const seccionAnterior = document.querySelector('.mostrar-seccion');
    if (seccionAnterior) {
        seccionAnterior.classList.remove('mostrar-seccion');
    }


    const seccionActual = document.querySelector(`#paso-` + pagina);
    seccionActual.classList.add('mostrar-seccion');

    //Eliminar la clase actul en el tab
    const tabAnterior = document.querySelector('.tabs button.actual');
    if (tabAnterior) {
        tabAnterior.classList.remove('actual');
    }


    //Resaltar el tab //Agregar la clase de actual en el nuevo tab
    const tab = document.querySelector(`[data-paso="${pagina}"]`);
    tab.classList.add('actual');
}

function cambiarSeccion() {
    const enlaces = document.querySelectorAll('.tabs button');

    enlaces.forEach(enlace => {
        enlace.addEventListener('click', e => {
            e.preventDefault();
            pagina = parseInt(e.target.dataset.paso);

            //Llamar la funcion de mostrar sección
            mostrarSeccion();

            //Para que funcionen los botones de paginador al usar los tabs
            botonesPaginador();
        })
    })
}

async function mostrarServicios() {
    try {
        const resultado = await fetch('./servicios.json');
        const db = await resultado.json();
        const { servicios } = db;

        //GENERAR HTML
        servicios.forEach(servicio => {
            const { id, nombre, precio } = servicio;

            //DOM Scripting
            //Generar Nombre servicio
            const nombreServicio = document.createElement('P');
            nombreServicio.textContent = nombre;
            nombreServicio.classList.add('nombre-servicio');

            //Generar Precio Servicio
            const precioServicio = document.createElement('P');
            precioServicio.textContent = `$ ` + precio;
            precioServicio.classList.add('precio-servicio');

            //GENERAR DIV CONTENEDOR DE SERVICIO
            const servicioDiv = document.createElement('div');
            servicioDiv.classList.add('servicio');
            servicioDiv.dataset.idServicio = id;


            //Selecciona un Servicio Para la cita
            servicioDiv.onclick = seleccionarServicio;


            //Inyectar Precio  Nombre
            servicioDiv.appendChild(nombreServicio);
            servicioDiv.appendChild(precioServicio);

            //Inyectar al HTML
            document.querySelector('#servicios').appendChild(servicioDiv);
        });
    } catch (error) {
        console.log(error);
    }
}

function seleccionarServicio(e) {
    let elemento;
    //Forzar que el elemento al cual se le da clic, sea el div
    if (e.target.tagName === 'P') {
        elemento = e.target.parentElement;
    } else {
        elemento = e.target;
    }
    //Condicion si selecciona el servicio se le agrega la clase 
    if (elemento.classList.contains('seleccionado')) { //Verificar si clase existe
        elemento.classList.remove('seleccionado');

        //Eliminando en Resumen seleccionado
        const id = parseInt(elemento.dataset.idServicio);
        eliminarServicio(id);

    } else {
        elemento.classList.add('seleccionado');

        //Contruir objeto con el servicio seleccionado
        const servicioObj = {
                id : parseInt(elemento.dataset.idServicio),
                nombre : elemento.firstElementChild.textContent,
                precio : elemento.firstElementChild.nextElementSibling.textContent
            }
            // console.log(servicioObj);
        agregarServicio(servicioObj);
    }
}
//Agregar Servicio al resumen
function agregarServicio(servicioObj) {
    const { servicios } = cita;
    cita.servicios = [...servicios, servicioObj];
    // console.log(cita);
}

//Eliminar Servicio del resumen
function eliminarServicio(id) {
    const { servicios } = cita;
    //Trae todos los servicios seleccionados
    // menos el que estamos eliminando
    cita.servicios = servicios.filter(service => service.id !== id)
        // console.log(cita);
};



function paginaSiguiente() {
    const paginaSiguiente = document.querySelector('#siguiente');
    paginaSiguiente.addEventListener('click', () => {
        pagina++;

        console.log(pagina);
        botonesPaginador();
    })
}

function paginaAnterior() {
    const paginaAnterior = document.querySelector('#anterior');
    paginaAnterior.addEventListener('click', () => {
        pagina--;

        console.log(pagina);
        botonesPaginador();
    })
}

function botonesPaginador() {
    const paginaSiguiente = document.querySelector('#siguiente');
    const paginaAnterior = document.querySelector('#anterior');
    if (pagina === 1) {
        paginaAnterior.classList.add('ocultar');
        paginaSiguiente.classList.remove('ocultar');
    } else if (pagina === 3) {
        paginaSiguiente.classList.add('ocultar');
        paginaAnterior.classList.remove('ocultar');
        mostrarResumen(); // Estamos en la pagina 3 caragar el resumen de la cita
    } else {
        paginaAnterior.classList.remove('ocultar');
        paginaSiguiente.classList.remove('ocultar');
    }
    mostrarSeccion(); //Cambia la sesión que se muestra por la de la pagina
}

function mostrarResumen() {
    //Destructurin
    const { nombre, fecha, hora, servicios } = cita;
    console.log(cita);
    //     //Seleccionar resumen
    const resumenDiv = document.querySelector('.contenido-resumen');

    //Limpiar html preview
    while (resumenDiv.firstChild) {
        resumenDiv.removeChild(resumenDiv.firstChild);
    }

    //Validacion Objeto
    if (Object.values(cita).includes('')) {
        const noServicios = document.createElement('P');
        noServicios.textContent = 'Faltan datos de servicios, por favor llenarlos todos*';

        noServicios.classList.add('invalidar-cita');

        //Agregar a resumen div
        resumenDiv.appendChild(noServicios);

        return;
    }

    const headingCita = document.createElement('h3');
    headingCita.textContent = 'Resumen de Cita';
    resumenDiv.appendChild(headingCita);

    //Mostrar resumen
    const nombreCita = document.createElement('P');
    nombreCita.innerHTML = `<span>Nombre:</span> ${nombre}`;
    resumenDiv.appendChild(nombreCita);

    const fechaCita = document.createElement('P');
    fechaCita.innerHTML = `<span>Fecha:</span> ${fecha}`;
    resumenDiv.appendChild(fechaCita);

    const horaCita = document.createElement('P');
    horaCita.innerHTML = `<span>Hora:</span> ${hora}`;

    const serviciosCita = document.createElement('div');
    serviciosCita.classList.add('resumen-servicios');

    const headingServicios = document.createElement('h3');
    headingServicios.textContent = 'Resumen de Servicios';
    serviciosCita.appendChild(headingServicios);

    let cantidad = 0;

    //Iterar sobre el arreglo de servicios
    servicios.forEach(servicio => {

        const { nombre, precio } = servicio;
        const contenedorServicio = document.createElement('div');
        contenedorServicio.classList.add('contenedor-servicio');

        const textoServicio = document.createElement('p');
        textoServicio.textContent = nombre;

        const precioServicio = document.createElement('p');
        precioServicio.textContent = precio;
        precioServicio.classList.add('precio');

        //Cantidad a pagar
        const totalServicio = precio.split('$');
        cantidad += parseInt(totalServicio[1].trim());

        //Colocar texto y precio en el div
        contenedorServicio.appendChild(textoServicio);
        contenedorServicio.appendChild(precioServicio);

        serviciosCita.appendChild(contenedorServicio);
    });


    resumenDiv.appendChild(horaCita);
    resumenDiv.appendChild(serviciosCita);

    //Agregar Cantidad al resumen
    const cantidadPagar = document.createElement('p');
    cantidadPagar.classList.add('total');
    cantidadPagar.innerHTML = `<span>Total a pagar: </span>$ ${cantidad}`
    resumenDiv.appendChild(cantidadPagar);
}

function nombreCita() {
    const nombreInput = document.querySelector('#nombre');
    nombreInput.addEventListener('input', evt => {
        const nombreTexto = evt.target.value.trim();
        // Validacion de que elnombre debe traer algo
        if (nombreTexto === '' || nombreTexto.length < 3) {
            mostrarAlerta('Nombre invalido', 'error');
        } else {
            const alerta = document.querySelector('.alerta');
            if (alerta) {
                alerta.remove();
            }
            cita.nombre = nombreTexto;
        }
    });
}

function mostrarAlerta(mensaje, tipo) {

    //Si hay una alerta preview entonces no crear mas
    const alertaPreview = document.querySelector('.alerta');
    if (alertaPreview) {
        return;
    }

    const alerta = document.createElement('DIV');
    alerta.textContent = mensaje;
    alerta.classList.add('alerta');

    if (tipo === 'error') {
        alerta.classList.add('error');
    }

    //Insertar en el html
    const formulario = document.querySelector('.formulario');
    formulario.appendChild(alerta);

    //Eliminar alerta despues de 3 segundos
    setTimeout(() => {
        alerta.remove();
    }, 3000);
}

function fechaCita() {
    const fechaInput = document.querySelector('#fecha');
    fechaInput.addEventListener('input', e => {
        // const opciones = {
        //     weekday: 'long',
        //     year: 'numeric',
        //     month: 'long'
        // }

        const dia = new Date(e.target.value).getUTCDay();

        if ([0].includes(dia)) {
            e.preventDefault();
            fechaInput.value = '';
            mostrarAlerta('Fines de semana no son permitidos', 'error');
        } else {
            cita.fecha = fechaInput.value;
            console.log(cita);
        }
    })
}

function deshabilitarDiasAnteriores() {
    const inputFecha = document.querySelector('#fecha');

    const fechaAhora = new Date();
    const year = fechaAhora.getFullYear();
    const mes = (fechaAhora.getMonth() + 1).toString().padStart(2, "0");
    const dia = fechaAhora.getDate() + 1;

    //Formato deseado: AAAA-MM-DD

    const fechaDeshabilitar = `${year}-${mes}-${dia}`;
    inputFecha.min = fechaDeshabilitar;
}

function horaCita() {
    const inputHora = document.querySelector('#hora');
    inputHora.addEventListener('input', e => {
        const horaCita = e.target.value;
        const hora = horaCita.split(':');

        if (hora[0] < 10 || hora[0] > 18) {
            mostrarAlerta('Hora no valida', 'error');
            setTimeout(() => {
                inputHora.value = '';
            }, 3000);
        } else {
            cita.hora = horaCita;
        }
    })
}