

const video = document.getElementById('webcam');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const generarBtn = document.getElementById('generar');
const resultadoDiv = document.getElementById('resultado');
const barcodeDiv = document.getElementById('barcode');
const githubLink = document.getElementById('github');
const pinarLogo = document.getElementById('logo');

let stream;

async function listarWebcams() {
    try {
        // Solicitar permisos para acceder a la cámara
        await navigator.mediaDevices.getUserMedia({ video: true });

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        // Limpiar las opciones existentes
        webcamSelector.innerHTML = '';

        if (videoDevices.length === 0) {
            console.warn("No se encontraron dispositivos de video.");
        }

        videoDevices.forEach((device, index) => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.text = device.label || `Webcam ${index + 1}`;
            webcamSelector.appendChild(option);
        });

        console.log("Dispositivos de video encontrados:", videoDevices);
    } catch (error) {
        console.error("Error al listar las webcams:", error);
    }
}

async function iniciarWebcam(deviceId) {
    try {
        const constraints = {
            video: {
                deviceId: deviceId ? { exact: deviceId } : undefined,
                width: 640,
                height: 480
            }
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        // Detener el flujo de video anterior si existe
        if (video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
        }

        video.srcObject = stream;
    } catch (error) {
        console.error("Error al iniciar la webcam:", error);
    }
}

// Escuchar el evento change del selector de webcams
webcamSelector.addEventListener('change', (event) => {
    const selectedDeviceId = event.target.value;
    iniciarWebcam(selectedDeviceId);
});

// Iniciar la primera webcam por defecto
listarWebcams().then(() => {
    if (webcamSelector.options.length > 0) {
        iniciarWebcam(webcamSelector.options[0].value);
    }
});

function obtenerEntropiaDeWebcam() {
    return new Promise((resolve) => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let entropia = 0;
        for (let i = 0; i < data.length; i += 4) {
            entropia += data[i] + data[i + 1] + data[i + 2];
        }

        console.log("Entropía:", entropia);
        resolve(entropia);
    });
}

function generarNumeroAleatorio(min, max, entropia) {
    const rango = max - min + 1;
    return min + (entropia % rango);
}

generarBtn.addEventListener('click', async () => {
    const desde = parseInt(document.getElementById('desde').value);
    const hasta = parseInt(document.getElementById('hasta').value);

    if (isNaN(desde) || isNaN(hasta) || desde >= hasta) {
        alert("Por favor, ingresa valores válidos. 'Desde' debe ser menor que 'Hasta'.");
        return;
    }

    const entropia = await obtenerEntropiaDeWebcam();
    const numeroAleatorio = generarNumeroAleatorio(desde, hasta, entropia);
    resultadoDiv.textContent = `${numeroAleatorio}`;
    barcodeDiv.textContent = `${numeroAleatorio}`;
});

const ciudades = [
    { nombre: "MADRID", zona: "Europe/Madrid" },
    { nombre: "BUENOS AIRES", zona: "America/Argentina/Buenos_Aires" },
    { nombre: "CARACAS", zona: "America/Caracas" },
    { nombre: "LOS ÁNGELES", zona: "America/Los_Angeles" },
    { nombre: "PEKÍN", zona: "Asia/Shanghai" },
    { nombre: "LISBOA", zona: "Europe/Lisbon" },
    { nombre: "LONDRES", zona: "Europe/London" },
    { nombre: "BERLÍN", zona: "Europe/Berlin" },
    { nombre: "NUEVA YORK", zona: "America/New_York" },
    { nombre: "ROMA", zona: "Europe/Rome" },
    { nombre: "LA PALMA", zona: "Atlantic/Canary" }
];

function actualizarHoras() {
    const ahora = new Date();
    const formatoHora = { hour: '2-digit', minute: '2-digit', hour12: false };

    const horas = ciudades.map(ciudad => {
        const horaCiudad = ahora.toLocaleTimeString('es-ES', { ...formatoHora, timeZone: ciudad.zona });
        return `${ciudad.nombre} ${horaCiudad}`;
    });

    horas.splice(9, 0, horas[0]);

    document.getElementById('timesx').textContent = horas.join(' | ');
}



setInterval(actualizarHoras, 1000);

githubLink.addEventListener('click', async () => {
    await Neutralino.os.open('https://github.com/gruposcoutpinar/pinar-rand');
});

pinarLogo.addEventListener('click', async () => {
    await Neutralino.os.open('https://gspinar.com');
});

window.addEventListener('contextmenu', (event) => event.preventDefault());


listarWebcams();
iniciarWebcam();
actualizarHoras();



Neutralino.init();
