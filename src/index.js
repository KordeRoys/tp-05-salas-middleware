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
];
  

