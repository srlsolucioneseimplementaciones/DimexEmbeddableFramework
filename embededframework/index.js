const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('certificado-autofirmado-key.pem'),
  cert: fs.readFileSync('certificado-autofirmado-cert.pem')
};

const port = 443;

const server = https.createServer(options, (req, res) => {
  if (req.url === '/framework.js') {
    // Lee el archivo JavaScript
    fs.readFile('framework.js', 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error interno del servidor');
      } else {
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(data);
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Archivo no encontrado');
  }
});

server.listen(port, () => {
  console.log(`Servidor en funcionamiento en el puerto ${port}`);
});