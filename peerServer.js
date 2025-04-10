import { PeerServer } from 'peer';

const peerServer = PeerServer({
  port: 9000,
  path: '/',
  allow_discovery: true,
  debug: true,
  proxied: true,
});

peerServer.on('connection', (client) => {
  console.log(`Client connected: ${client.getId()}`);
});

peerServer.on('disconnect', (client) => {
  console.log(`Client disconnected: ${client.getId()}`);
});

peerServer.on('error', (error) => {
  console.error('PeerJS server error:', error);
});

console.log('PeerJS server running on port 9000'); 