/* ============= INICIO DE ROUTEO ============= */
import express from 'express';
const routerInitial = express.Router();
import { Contenedor } from '../container/Contenedor.js'

/* ============ Creacion de objeto ============ */
import { ContenedorSQLite } from '../container/ContenedorSQLite.js';
import { ContenedorMySQL } from "../container/ContenedorMySQL.js";
const cajaMensajes = new ContenedorMySQL('mensajes');
const cajaProducto = new ContenedorSQLite('productos');

/* ============= Routing y metodos ============= */
routerInitial.get('/', async (req, res) => {
    const DB_PRODUCTOS = await cajaProducto.listarAll()
    const DB_MENSAJES = await cajaMensajes.listarAll()
    res.render('vista', {DB_PRODUCTOS, DB_MENSAJES})
})

/* ============= Error de Routing ============= */
routerInitial.get('*', (req, res) => {
    res.status(404).json({ error : -2, descripcion: `ruta ${req.path} método ${req.method} no implementado`})
})
routerInitial.post('*', (req, res) => {
    res.status(404).json({ error : -2, descripcion: `ruta ${req.path} método ${req.method} no implementado`})
})
routerInitial.delete('*', (req, res) => {
    res.status(404).json({ error : -2, descripcion: `ruta ${req.path} método ${req.method} no implementado`})
})
routerInitial.put('*', (req, res) => {
    res.status(404).json({ error : -2, descripcion: `ruta ${req.path} método ${req.method} no implementado`})
})

/* =========== Exportacion de modulo =========== */
export default routerInitial;