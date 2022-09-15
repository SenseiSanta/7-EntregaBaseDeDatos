/*=================== MODULOS ===================*/
import express from 'express';
import exphbs from 'express-handlebars';
import path from 'path';
import morgan from 'morgan';
import { ContenedorSQLite } from './src/container/ContenedorSQLite.js';
import { ContenedorMySQL } from "./src/container/ContenedorMySQL.js";
import { Server as HttpServer } from 'http';
import { Server as IOServer }  from 'socket.io';


/*=== Instancia de Server, contenedor y rutas ===*/
const app = express();
const httpServer = new HttpServer(app)
const io = new IOServer(httpServer)
const cajaMensajes = new ContenedorMySQL('mensajes');
const cajaProducto = new ContenedorSQLite('productos');
import routerProductos from './src/routes/productos.routes.js';
import routerInitial from './src/routes/initial.routes.js'


/*================= Middlewears =================*/
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))
app.use(express.static('./public'))


/*============= Motor de plantillas =============*/
app.engine('hbs', exphbs.engine({
    defaulyLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: 'hbs'
}))
app.set('views', path.join('views'))
app.set('view engine', 'hbs')


/*==================== Rutas ====================*/
app.use('/', routerInitial)
app.use('/api/productos', routerProductos);
app.use('*', (req, res) => {
    res.send({error: 'Producto no encontrado'})
})

/*================== Servidor ==================*/
const PORT = 8080;
const server = httpServer.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${server.address().port}`)
})
server.on('error', error => console.log(`Error en el servidor: ${error}`))

/*================== Websocket ==================*/
io.on('connection', async (socket)=>{
    const DB_MENSAJES = await cajaMensajes.listarAll()
    const DB_PRODUCTOS = await cajaProducto.listarAll()
    console.log(`Nuevo cliente conectado -> ID: ${socket.id}`)
    io.sockets.emit('from-server-message', DB_MENSAJES)
    io.sockets.emit('from-server-product', DB_PRODUCTOS)
    
    socket.on('from-client-message', async mensaje => {
        await cajaMensajes.insertar(mensaje)
        const MENSAJES = await cajaMensajes.listarAll()
        io.sockets.emit('from-server-message', MENSAJES)
    })

    socket.on('from-client-product', async product => {
        await cajaProducto.insertar(product)
        const PRODUCTOS = await cajaProducto.listarAll()
        io.sockets.emit('from-server-product', PRODUCTOS)
    })
})