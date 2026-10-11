# Trabajo práctico 05
## Descripción
Este proyecto administra reservas de salas.

## Instalación
npm install express ejs express-ejs-layouts morgan

## Ejecución
npm start

## Rutas
GET http://localhost:3000//
GET http://localhost:3000//estado
GET http://localhost:3000//reservas
GET http://localhost:3000//reservas/nueva
GET http://localhost:3000//reservas/:id
POST http://localhost:3000//reservas

## Pipeline de middleware
app.use(morgan("dev")); --> app.use(identificarSolicitud); --> app.use(medirDuracion);  --> app.use(expressLayouts); --> app.use(express.static("")) --> express.urlencoded(...) --> app.use(express.json()); --> reservasRouter.use(prepararAreaReservas); --> app.use("/reservas", reservasRouter);

## Validación

Se valida que:
- el nombre del estudiante no esté vacío
- el email incluya `@`
- la sala, fecha, turno y cantidad de personas estén completos
- la cantidad de personas esté entre 1 y 5

Si algún dato es inválido, se responde con un `400` y se informa el error.

## Pruebas manuales
1. Abrir la app con `npm start`.
2. Ir a `http://localhost:3000/`.
3. Acceder a `http://localhost:3000/reservas/nueva`.
4. Completar el formulario con datos válidos y enviar.
5. Verificar que la reserva aparezca en `/reservas`.
6. Probar errores:
   - email sin `@`
   - personas fuera del rango
   - campos vacíos

## Persistencia temporal
Este proyecto guarda las reservas en un array en memoria dentro de index.js. Eso significa que:
- los datos se mantienen mientras el servidor siga corriendo
- al reiniciar la app, la información se pierde
- la persistencia es temporal y no queda guardada en una base de datos ni archivo

## Preguntas Apartes

# diferencia entre middleware incorporado, de terceros y personalizado: 
 Los middlewares incorporados vienen con Express ej:express.json() o express.unlercoded(), los de terceros se instalan aparte como morgan y express-ejs-layouts y los personalizados los creamos y utilizamos nosotros para distintar funciones como medir tiempos de duracion, validar datos, identificar una solicitud etc.
# cuándo se utiliza next():
 Next se utiliza como puntero al terminar una funcion para pasar a la siguiente cuando queremos ejecutar un pipeline (una cadena de procesos o funciones)  

#  por qué los parsers aparecen antes de la validación:
Los parsers son funciones que convierten datos crudos de una request en un formato que el código puede usar (ej express.json), y las validaciones (como la funcion validarDatosReserva) solo existe después de que el parser transformó o valido los datos entrantes.

# diferencia entre alcance global, de router y de ruta;

# motivo del evento finish:
Se usa para saber cuándo la respuesta ya terminó de enviarse al cliente.

# resultado del montaje del router
Al montar el router bajo /reservas, todas sus rutas quedan prefijadas con esa URL. Esto permite organizar la lógica por recursos y simplificar la estructura del proyecto.

# diferencia entre el POST 302 y el GET posterior
302 significa que el servidor aceptó la petición y el GET posterior carga la página final en el que se va a mostrar el resultado

# motivo por el cual las altas desaparecen al reiniciar
Las “altas” en este proyecto son las reservas que se agregan con el formulario y desaparecen por que solo se guardan en la memoria del navegador y no en un json local o en un servidor entonces al apagar el proyecto se resetea la carga