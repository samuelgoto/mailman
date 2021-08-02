const DHT = require('bittorrent-dht');
const magnet = require('magnet-uri');

const uri = 'magnet:?xt=urn:btih:e3811b9539cacff680e418124272177c47477157';
const parsed = magnet(uri);

// console.log(parsed.infoHash);
// 'e3811b9539cacff680e418124272177c47477157'

exports.CLIENT_PORT = 0;

const dht = new DHT();

dht.listen(20000, function () {
  console.log('now listening')
});

dht.on('peer', function (peer, infoHash, from) {
  console.log('found potential peer ' + peer.host + ':' + peer.port + ' through ' + from.address + ':' + from.port)
});


//const value = Buffer.alloc(200).fill("hello world");
const value = "hello world";

const hash = "6d33adc2b6b2c14c3036feefb7fedbca1a880527";

console.log("reading");
dht.get(hash, {cache: false}, function(err, {v, id}) {
  console.log(`got some: ${v.toString()} from ${id.toString('hex')}`);
});

return;

console.log("writing");
dht.put({v: value}, function (err, hash) {
  console.error('error=', err)
  console.log('hash=', hash.toString('hex'))

  dht.get(hash, {cache: false}, function(err, {v, id}) {
    console.log("got some");
    console.log(v.toString());
    // console.log(id);
  });
  
  // find peers for the given torrent info hash
  // dht.lookup(parsed.infoHash);
  // dht.lookup(new String(hash));
});

