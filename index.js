"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const http_1 = __importDefault(require("http"));
const dotenv_config_1 = require("./config/dotenv.config");
const db_config_1 = require("./config/db.config");
const cloudinary_config_1 = __importDefault(require("./config/cloudinary.config"));
const image_router_1 = require("./route/image.router");
const home_route_1 = require("./route/home.route");
const cors_1 = __importDefault(require("cors"));
const crypto_1 = __importDefault(require("crypto"));
const auth_route_1 = require("./route/auth.route");
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const port = process.env.PORT;
(0, dotenv_config_1.loadEnv)();
app.use(express_1.default.json());
app.use(body_parser_1.default.json({ limit: "10mb" }));
app.use(body_parser_1.default.urlencoded({ extended: true, limit: "10mb" }));
// allowedCors();
try {
    const frontend = process.env.FRONTEND_URL;
    app.use((0, cors_1.default)({ origin: frontend }));
}
catch (e) {
    console.log("Cors issue : ", e);
}
(0, db_config_1.connectDatabase)();
// socketConnection();
// const io = new Server(server, {
//   cors: {
//       origin: process.env.FRONTEND_URL, 
//       methods: ["GET", "POST"],
//       credentials: true,
//   },
//   path: '/socket.io' 
// });
cloudinary_config_1.default.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const secret = crypto_1.default.randomBytes(64).toString('hex');
app.get("/", (req, res) => {
    res.send(`Server is listening on the Port${port}`);
});
//apis
app.use("/image", image_router_1.image.getImageUrl());
app.use("/home", home_route_1.home.home());
app.use('/api/v1', auth_route_1.auth.auth());
function startSocketIOServer(port) {
    const app = (0, express_1.default)();
    const server = http_1.default.createServer(app);
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL,
            methods: ["GET", "POST"],
            credentials: true,
        },
        path: '/socket.io',
    });
    let activeUsers = 0;
    io.on('connection', (socket) => {
        activeUsers++;
        // console.log("a user is no",activeUsers)
        io.emit('active-users', activeUsers);
        socket.on('new-user-joined', (name) => {
            socket.name = name;
            // socket.broadcast.emit('user-joined', name);
        });
        socket.on('send', (data) => {
            const { message, name } = data;
            // console.log('message',message,'data',data)
            socket.broadcast.emit('received', { message, name });
        });
        socket.on('disconnect', () => {
            if (socket.name) {
                activeUsers--;
                io.emit('active-users', activeUsers);
                // socket.broadcast.emit('left', socket.name);
            }
        });
    });
    server.listen(port, () => {
        console.log(`Listening on port ${port}`);
    });
}
startSocketIOServer(7000);
app.listen(port, () => {
    console.log(`server is listening to the port ${port}`);
});
