const express = require('express');
const Jimp = require('jimp');
const URL = require('url').URL;

const aphexer = require('./lib/afx/aphexFaceReplacer.js');

const app = express();

app.get('/', function(req, res) {
    let afxQuery = req.query.afx;
    console.log(`request received for ${afxQuery}`);

    if (!afxQuery) return res.status(400).send('"afx" query string with valid image URI required, example: /?afx=http://example.com/photo.jpeg');

    let imageHref;
    try {
        imageHref = new URL(afxQuery).href;
    } catch(err) {
        return res.sent(`Invalid URL: ${err.message}`);
    }

    let mime_type;
    if (imageHref.endsWith('.jpeg') || imageHref.endsWith('.jpg')) {
        mime_type = Jimp.MIME_JPEG;
    } else if (imageHref.endsWith('.png')) {
        mime_type = Jimp.MIME_PNG;
    } else {
        return res.status(404).send('Not Found');
    }

    aphexer(imageHref, function(err, response) {
        if (err && !err.nofaces) {
            console.error("Error aphexing.", err);
            return res.status(err.status || 500).send('Error!');
        }

        if (err && err.nofaces) {
            console.log("No faces found", imageHref);
        } else {
            console.log("Success aphexing", imageHref);
        }

        res.writeHead(200, {
            'Content-Type': mime_type,
            'Content-Length': response ? response.length : 0,
        });
        res.end(response, 'binary');
    });
});

let server = app.listen(process.env.PORT || 3001, function() {
    console.log(`Listening at ${server.address().address} ${server.address().port}`);
});
