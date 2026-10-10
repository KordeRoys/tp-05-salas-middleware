const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const morgan = require("morgan");
const path = require("node:path");

const app = express();
const PORT = 3000;
 
const reservas = [
    {
        id: 1,
        estudiante: "Juan",
        email: "juan@hotmail.com",
        sala: "Sala Norte",
        fecha: "27/10/26",
        turno: "Mañana",
        personas: 2
    },
    {
        id: 2,
        estudiante: "Pedro",
        email: "jpedro@hotmail.com",
        sala: "Sala Sur",
        fecha: "28/10/26",
        turno: "Tarde",
        personas: 1
    },
    {
        id: 3,
        estudiante: "Eugenia",
        email: "eugeniao@hotmail.com",
        sala: "Sala Multimedia",
        fecha: "28/10/26",
        turno: "Tarde",
        personas: 1
    },{
        id: 4,
        estudiante: "Carina",
        email: "carina@hotmail.com",
        sala: "Sala Norte",
        fecha: "28/10/26",
        turno: "Tarde",
        personas: 1
    },
];

let numeroDeSolicitud = 0;
//DATOS QUE SE VAN A LLAMAR ANTES Y MOSTRAR POR CONSOLA
function identificarSolicitud(req, res, next) { //Esto sirve para mostrat en consola el metodo y la ruta de la solicitud, y ademas asignarle un id unico a cada solicitud, que se va a poder usar en cualquier parte del codigo, ya que se guarda en el objeto res.locals
    numeroDeSolicitud += 1;
    res.locals.solicitudId = `CAM- Cantidad de solicitudes:${String(numeroDeSolicitud)}`;//locals.solicitudId es una variable que se va a poder usar en cualquier parte del codigo, ya que se guarda en el objeto res.locals. CAM
    console.log(`identificarSolicitud : [${res.locals.solicitudId}] ${req.method} ${req.originalUrl}`,//locals es un objeto que se puede usar para guardar variables que se van a usar en cualquier parte del codigo, ya que se guarda en el objeto res.locals
    );
    next();
} //Va sin puntos y comas

//DATOS QUE SE VAN A LLAMAR ANTES Y MOSTRAR POR CONSOLA
function medirDuracion(req, res, next) {
    const inicio = process.hrtime.bigint();

    res.on("finish", () => {
        const fin = process.hrtime.bigint();
        const milisegundos = Number(fin - inicio) / 1_000_000;
        console.log(
            `Duracion:[${res.locals.solicitudId}] ${req.method} ${req.originalUrl} ` + //solicitudId proviene de la funcion identificarSolicitud
            `${res.statusCode} ${milisegundos.toFixed(2)} ms`,
        ); //Esto va a calcular la diferencia de horario entre la hora de fin y la hora de inicio
    });
    next();
} 

function prepararAreaReservas(req, res, next) { //Esta funcion sirve setear la variable res.locals.seccion con el valor "Inscripciones a Caminatas", que luego se va a usar en la vista para mostrar el titulo de la pagina.
    res.locals.seccion = "Solicita reserva"; //res.locals es un objeto que se puede usar para guardar variables que se van a usar en cualquier parte del codigo, ya que se guarda en el objeto res.locals. Y .seccion es una propiedad que se va a usar en la vista para mostrar el titulo de la pagina en listas.ejs 
    console.log("Seccion: " + res.locals.seccion) //Y seccion sirve para mostrar el titulo de la pagina en la vista.
    next();
}

function validarDatosReserva(req, res, next) {
    const estudiante = req.body.estudiante?.trim(); //estudiante? el signo ? sirve para que si estudiante es undefined no tire error, y trim() sirve para quitar los espacios en blanco al principio y al final del string
    const email = req.body.email?.trim();
    const sala = req.body.sala?.trim();
    const fecha = req.body.fecha?.trim();
    const turno = req.body.turno?.trim();
    const personas = Number(req.body.personas);

    if(!estudiante || !email || !sala || !fecha || !turno ||!Number.isFinite(personas) || !personas >= 1 && !personas <=5 ){ //!personas >= 1 && !personas <=5 significa que si personas es menor a 1 o mayor a 5, entonces es invalido
        return res.status(400).send("Datos ivalidados", {
            titulo: "nueva inscripcion",
            error: "revisa los cambios y elegi entre 1 y 5 lugares.",
            valores: req.body
        });
    }
    req.reservaValidada = { estudiante, email, sala, fecha, turno, personas} // Esta linea sirve para guardar los datos validados en el objeto req, para que luego se puedan usar en la funcion crearInscripciones
    next(); //En el caso de que no haya casos invalidos continuamos el flujo con next
};
  
function crearInscripciones(req, res) {//ESTA FUNCION VA AL POST
    const ultimoId =
        reservas.length === 0 ? 0 : reservas[reservas.length - 1].id; //reservas proviene del array reservas que esta definido al principio del archivo, y sirve para obtener el id del ultimo elemento del array reservas, para luego sumarle 1 y asignarlo al nuevo objeto que se va a pushear al array reservas
    reservas.push({
        id: ultimoId + 1,
        ...req.reservaValidada, //... sirve para copiar todas las propiedades del objeto req.reservaValidada en el nuevo objeto que se va a pushear al array reservas
    });
    res.redirect("/reservas");
} //Si estamos en la ultima funcion next no hace falta agregarlo

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));
app.set("layout", "layouts/main");
app.use(morgan("dev"));

app.use(identificarSolicitud);
app.use(medirDuracion);
app.use(expressLayouts);
app.use(express.static(path.join(__dirname, "..", "public")));
//SIEMPRE* express.unlercodec y express.json antes de los endpoints para que sea legible antes el formato del POST 
//app.set define rutas de de recursos estaticos
//app.use es la manera de decirle a express que use un middleware, en este caso express.urlencoded y express.json son middlewares que sirven para procesar los datos enviados por un formulario HTML. 
app.use(express.urlencoded({ extended: false })); //extended: false indica que no se van a procesar objetos anidados, solo pares nombre-valor simples. 
app.use(express.json()); 

app.get("/", (req, res) => {
    res.status(200).render("inicio", { 
        titulo: "Consulta tus reservas" });
});

app.get("/estado", (req, res) => {
    res.status(200).json({
        servicio: "activo",
        reservas: reservas.length, //Esto muestra la cantidad de reservas guardadas en el array
        solicitudId: res.locals.solicitudId, //Esta linea mmuestra la cantidad de solicitudes hechas y se suma en 1 por cada actualizacion
    })
});

//NUEVO* Ahora vamos a vamos a usar el enrutador con preparaAreaReservas para los nuevos endpoints
const reservasRouter = express.Router();
//Cada endpoint que enrutemos ahora tendra el middleware prepararAreaReservas, que setea la variable res.locals.seccion con el valor "Solicita reserva", que luego se va a usar en la vista para mostrar el titulo de la pagina.
reservasRouter.use(prepararAreaReservas);

reservasRouter.get("/", (req, res) => {

    res.status(200).render("reservas/lista", {
        titulo: "Reservas",
        reservas,
    })
});

reservasRouter.get("/nueva", (req, res) => {
    res.status(200).render("reservas/nueva", {
        titulo: "AGREGUE UNA NUEVA RESERVA",
        error: null,
        valores: {},//En este caso no estamos utilizando nada
    });

});

reservasRouter.get("/:id", (req, res) => {
    const id = Number(req.params.id);  
    const reserva = reservas.find((e) => e.id === id);
    if (!reserva) {
            return res.status(404).render("no-encontrado", {
                titulo: "No se encontro reserva",
                mensaje: "No existe reserva con ese identificador.",
            });
        }
        res.render("reservas/detalle", {
            titulo: reserva.estudiante,
            reserva,
        });
});

reservasRouter.post("/", validarDatosReserva, crearInscripciones) // Aqui llega la cadena, la reconoce y comineza la ejecucion con validarReserva y luego de validar para a crearReserva
 
app.use("/reservas", reservasRouter);

app.listen(PORT, () => {
    console.log(`servidor funcionando en http://localhost:${PORT}`);
});

