import 'express-async-errors';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import routes from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';
import { setupWebSocket } from './config/socket.js';

const app = express( );
const server = createServer(app);

app.use(cors());
app.use(express.json());

setupWebSocket(server);

app.use(routes);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 UniFicha API rodando na porta ${PORT}`);
});