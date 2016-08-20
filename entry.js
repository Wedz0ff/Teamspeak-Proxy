//Constants
const LOCAL_PORT = 6512;
const REMOTE_PORT = 6013;
const REMOTE_HOST = 'eu68.ts3.cloud';

//Modules
const proxy = require('udp-proxy');

//Startup
var server = proxy.createServer({
	address: REMOTE_HOST,
	port: REMOTE_PORT,
	localport: LOCAL_PORT
});

server.on('listening', function (details) {
	var local = details.server;
	var target = details.target;

	console.log('TS3 traffic is forwarded from %s:%d (%s) to %s:%d (%s)', local.address, local.port, local.family, target.address, target.port, target.family);
});

server.on('bound', function (details) {
	var local = details.route;
	var remote = details.peer;

	console.log('%s:%d --> %s:%d', local.address, local.port, remote.address, remote.port);
});

server.on('proxyClose', function (peer) {
	console.log('Disconnecting socket from %s!', peer.address);
});

server.on('proxyError', function (err) {
	console.log('ProxyError: %s', err);
});

server.on('error', function (err) {
	console.log('GeneralError: %s', err);
});