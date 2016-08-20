const net = require('net');
const util = require('util');
const events = require('events');

function TcpProxy(options) {
    events.call(this);
    const self = this;

    //Proxy server details
    var serverHost = options.localaddress || '0.0.0.0';
    var serverPort = options.localport || 0;

    //Target server details
    var host = options.address || 'localhost';
    var port = options.port || 0;

    //Proxy startup
    function proxyThisSocket(proxySoc) {
        if (!proxySoc)
            return;

        var targetSoc = new net.Socket();
        proxySoc.on('data', (buffer) => {
            //Transmitting data to target server from client
            targetSoc.write(buffer);
        });
        targetSoc.on('data', (buffer) => {
            //Transmitting data from target server to client
            proxySoc.write(buffer);
        });
        proxySoc.on('close', (had_error) => {
            //Closes the proxy connection
            targetSoc.end();
        });
        proxySoc.on('error', (err) => {
            self.emit('error', err);
        });
        targetSoc.on('error', (err) => {
            self.emit('error', err);
        });
        targetSoc.connect(parseInt(port), host, () => {
            self.emit('bound', {
                route: proxySoc.address(),
                peer: targetSoc.address()
            });
        });
    }

    var server = net.createServer((proxySocket) => {
        proxyThisSocket(proxySocket);
    }).listen(serverPort, serverHost).on('listening', () => {
        self.emit('listening', {
            server: server.address(),
            target: {
                address: host,
                port: port
            }
        });
    });

    this.close = (callback) => {
        server.close(callback);
    };
};

util.inherits(TcpProxy, events);
exports.createServer = (options) => {
    return new TcpProxy(options);
};