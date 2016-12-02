var generate = require('./captcha').generate;
require('./captcha').setSize(18, 30);

require('http').createServer(function (req, res) {
    if (req.url === '/captcha') {
        var captcha = generate(5);
        res.writeHead(200, {
            'content-type': 'image/png',
            'content-length': captcha.buffer.length,
            'set-cookie': 'code=' + captcha.chars
        });
        res.end(captcha.buffer)
    }
}).listen(8220, function () {
    console.log('visit http://localhost:8220/captcha')
});