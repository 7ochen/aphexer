const express = require('express');
const formidable = require('express-formidable');
const Jimp = require('jimp');
const URL = require('url').URL;

const aphexer = require('./lib/afx/aphexFaceReplacer.js');

const app = express();
app.use(formidable());

app.post('/upload', function(req, res) {
    console.log(req.fields); // contains non-file fields
    console.log(req.files); // contains files
    let imageLocation = req.files.afx.path + '/' + req.files.afx.name

    let mime_type;
    if (imageLocation.endsWith('.jpeg') || imageLocation.endsWith('.jpg')) {
        mime_type = Jimp.MIME_JPEG;
    } else if (imageLocation.endsWith('.png')) {
        mime_type = Jimp.MIME_PNG;
    } else {
        return res.status(404).send('Not Found');
    }

    aphexer(req.files.afx.path, function(err, response) {
        if (err && !err.nofaces) {
            console.error("Error aphexing.", err);
            return res.status(err.status || 500).send('Error!');
        }

        if (err && err.nofaces) {
            console.log("No faces found", imageLocation);
        } else {
            console.log("Success aphexing", imageLocation);
        }

        res.writeHead(200, {
            'Content-Type': mime_type,
            'Content-Length': response ? response.length : 0,
        });
        res.end(response, 'binary');
    });
});

app.get('/', function(req, res) {
    let afxQuery = req.query.afx;
    console.log(`request received for ${afxQuery}`);

    if (!afxQuery) {
        return res.sendFile(`${__dirname}/views/index.html`);
        // return res.status(400).send();
    }

    let imageHref;
    try {
        imageHref = new URL(afxQuery).href;
    } catch(err) {
        return res.send(`Invalid URL: ${err.message}`);
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
