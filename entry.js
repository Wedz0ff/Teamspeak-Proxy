//Constants
const LOCAL_PORT = 9987;
const LOCAL_PORT_FILE = 30033;
const LOCAL_PORT_QUERY = 10011;

const REMOTE_HOST = 'ts.spawnpoint.cz';
const REMOTE_PORT = 9987;
const REMOTE_PORT_FILE = 30033;
const REMOTE_PORT_QUERY = 10011;

//Modules
const commander = require('./modules/commander');
const uProxy = require('./modules/proxies/udp-proxy');
const tProxy = require('./modules/proxies/tcp-proxy');

//Voice proxy startup
var voiceProxy = uProxy.createServer({
	address: REMOTE_HOST,
	port: REMOTE_PORT,
	localport: LOCAL_PORT
});

voiceProxy.on('listening', function (details) {
	console.log('TS3 voice traffic is forwarded from %s:%d to %s:%d', details.server.address, details.server.port, details.target.address, details.target.port);
});

voiceProxy.on('bound', function (details) {
	console.log('[VOICE] %s:%d --> %s:%d', details.route.address, details.route.port, details.peer.address, details.peer.port);
});

voiceProxy.on('proxyClose', function (peer) {
	//console.log('Disconnecting socket from %s!', peer.address);
});

voiceProxy.on('proxyError', function (err) {
	console.log('[VOICE] ProxyERR: %s', err);
});

voiceProxy.on('error', function (err) {
	console.log('[VOICE] ERR: %s', err);
});

//File transfer proxy startup
var fileTransferProxy = tProxy.createServer({
	address: REMOTE_HOST,
	port: REMOTE_PORT_FILE,
	localport: LOCAL_PORT_FILE
});

fileTransferProxy.on('listening', (details) => {
	console.log('TS3 file transfer traffic is forwarded from %s:%d to %s:%d', details.server.address, details.server.port, details.target.address, details.target.port);
});

fileTransferProxy.on('bound', (details) => {
	console.log('[FILE] %s:%d --> %s:%d', details.route.address, details.route.port, details.peer.address, details.peer.port);
});

fileTransferProxy.on('error', (err) => {
	console.log('[FILE] ERR: %s', err);
});

//Query proxy startup
var queryProxy = tProxy.createServer({
	address: REMOTE_HOST,
	port: REMOTE_PORT_QUERY,
	localport: LOCAL_PORT_QUERY
});

queryProxy.on('listening', (details) => {
	console.log('TS3 query traffic is forwarded from %s:%d to %s:%d', details.server.address, details.server.port, details.target.address, details.target.port);
});

queryProxy.on('bound', (details) => {
	console.log('[QUERY] %s:%d --> %s:%d', details.route.address, details.route.port, details.peer.address, details.peer.port);
});

queryProxy.on('error', (err) => {
	console.log('[QUERY] ERR: %s', err);
});

//Commander startup
commander.begin();
commander.on('command', (cmd) => {
	//COMMANDS ! :>
});
commander.on('exit', () => {
	console.log('Stopping all the proxies...');
	fileTransferProxy.close((ftErr) => {
		console.log('File transfer proxy stopped!');
		queryProxy.close((queryErr) => {
			console.log('Server query proxy stopped!');
			voiceProxy._server.close(() => {
				console.log('Voice proxy stopped!');
				process.exit(0);
			});
		});
	});
});