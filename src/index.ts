import * as http from 'http';
import server from "./server";
import config from './environments';
import * as Middleware from './middlewares';

const PORT = config.APP_PORT;
const app = http.createServer(server.app);

server.routes();
server.app.use(Middleware.errorHandler);

app.listen(PORT, () => {
    console.log('Express server listening on port ' + PORT);
})