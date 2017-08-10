var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var multer = require('multer');
var multerS3 = require('multer-s3');

var fs = require('fs');
var AWS = require('aws-sdk');

AWS.config.loadFromPath('./s3_config.json');
var s3 = new AWS.S3();

var upload = multer()

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.set('json spaces', 4)

app.get('/', (req, res) => {
    console.log('GET --> /')
    res.sendFile(path.join(__dirname, 'index.html'))
})

app.get('/subir-imagen', (req, res) => {
    console.log('GET --> /subir-imagen')
    res.sendFile(path.join(__dirname, 'subir-imagen.html'))
})

app.post('/subir-imagen', upload.single('avatar'), (req, res) => {
    console.log('POST --> /subir-imagen')
    console.log('req.body.bucket -->')
    console.log(req.body.bucket)
    if (req.file !== undefined){
        console.log('req.file -->')
        console.log(req.file)
        res.sendFile(path.join(__dirname, 'exitoso.html'))
    } else {
        console.log('Hubo una Falla')
        res.sendFile(path.join(__dirname, 'fail.html'))
    }
})

app.get('/crear-bucket', (req, res) => {
    console.log('GET --> /crear-bucket')
    res.sendFile(path.join(__dirname, 'crear-bucket.html'))
})

app.post('/crear-bucket', (req, res) => {
    console.log('POST --> /crear-bucket')
    console.log('req.body -->')
    console.log(req.body)
    console.log('req.body.bucketName -->')
    console.log(req.body.bucketName)
    var item = req.body;
    var params = { Bucket: item.bucketName };
    console.log('params -->')
    console.log(params)
    s3.createBucket(params, function (err, data) {
        if (err) {
            return res.send({ "error": err });
        }
        res.send({ data });
    });
})

app.get('/listar-mis-buckets', (req, res) => {
    s3.listBuckets({}, function (err, data) {
        if (err) {
            return res.send({ "error": err });
        }
        res.send({ data });
    });
})

app.get('/eliminar-un-bucket', (req, res) => {
    console.log('GET --> /eliminar-un-bucket')
    res.sendFile(path.join(__dirname, 'eliminar-un-bucket.html'))
})

app.post('/eliminar-un-bucket', (req, res) => {
    console.log('POST --> /eliminar-un-bucket')
    console.log('req.body -->')
    console.log(req.body)
    console.log('req.body.bucketName -->')
    console.log(req.body.bucketName)
    var item = req.body;
    var params = { Bucket: item.bucketName };
    console.log('params -->')
    console.log(params)
    s3.deleteBucket(params, function (err, data) {
        if (err) {
            return res.send({ "error": err });
        }
        res.send({ data });
    });
})

app.get('/eliminar-un-bucket-cors', (req, res) => {
    console.log('GET --> /eliminar-un-bucket-cors')
    res.sendFile(path.join(__dirname, 'eliminar-un-bucket-cors.html'))
})

app.post('/eliminar-un-bucket-cors', (req, res) => {
    console.log('POST --> /eliminar-un-bucket-cors')
    console.log('req.body -->')
    console.log(req.body)
    console.log('req.body.bucketName -->')
    console.log(req.body.bucketName)
    var item = req.body;
    var params = { Bucket: item.bucketName };
    console.log('params -->')
    console.log(params)
    s3.deleteBucketCors(params, function (err, data) {
        if (err) {
            return res.send({ "error": err });
        }
        res.send({ data });
    });
})

app.get('/ver-objetos', (req, res) => {
    console.log('GET --> /ver-objetos')
    res.sendFile(path.join(__dirname, 'ver-objetos.html'))
});

app.post('/ver-objetos', (req, res) => {
    var item = req.body;
    var params = { Bucket: item.bucketName, Key: item.keyName };
    s3.getObject(params, function (err, data) {
        if (err) {
            return res.send({ "error": err });
        }
        res.send({ data });
    });
});

app.get('/eliminar-objeto', (req, res) => {
    console.log('GET --> /eliminar-objeto')
    res.sendFile(path.join(__dirname, 'eliminar-objeto.html'))
});

app.post('/eliminar-objeto', (req, res) => {
    var item = req.body;
    var params = { Bucket: item.bucketName, Key: item.keyName };
    console.log('params -->')
    console.log(params)
    s3.deleteObject(params, function (err, data) {
        if (err) {
            return res.send({ "error": err });
        }
        res.send({ data });
    });
});

app.get('/subir-archivo-amazon', (req, res) => {
    console.log('GET --> /subir-archivo-amazon')
    res.sendFile(path.join(__dirname, 'subir-archivo-amazon.html'))
})

app.post('/subir-archivo-amazon', (req, res) => {
    var upload = multer({
        storage: multerS3({
            s3: s3,
            bucket: 'api-ejemplo-alexander',
            acl: 'public-read',
            metadata: function (req, file, cb) {
                cb(null, { fieldName: file.fieldname });
            },
            key: function (req, file, cb) {
                cb(null, Date.now().toString() + ".jpg")
            }
        }),
        fileFilter: function(req, file, callback) {
		    var ext = path.extname(file.originalname)
		    if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
			    return callback(res.end('Only images are allowed'), null)
		    }
		    callback(null, true)
        },
        limits: {
            fileSize: 5000000
        }
    }).single('avatar')

    upload(req, res, function(err) {
        if (err) return res.send(err)
		return res.send('File is uploaded')
	})

})

app.get('/subir-archivos-amazon', (req, res) => {
    console.log('GET --> /subir-archivos-amazon')
    res.sendFile(path.join(__dirname, 'subir-archivos-amazon.html'))
})

app.post('/subir-archivos-amazon', (req, res) => {
    var upload = multer({
        storage: multerS3({
            s3: s3,
            bucket: 'api-ejemplo-alexander',
            acl: 'public-read',
            metadata: function (req, file, cb) {
                cb(null, { fieldName: file.fieldname });
            },
            key: function (req, file, cb) {
                cb(null, Date.now().toString() + ".png")
            }
        }),
        fileFilter: function(req, file, callback) {
		    var ext = path.extname(file.originalname)
		    if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
			    return callback(res.end('Only images are allowed'), null)
		    }
		    callback(null, true)
        },
        limits: {
            fileSize: 5000000
        }
    }).array('photos', 3)

    upload(req, res, function(err) {
        if (err) return res.send(err)
		return res.send('File is uploaded')
	})

})

var fs = require('fs');
var im = require('imagemagick');
var srcImage = "./fuente/fredy.png";
var desPath = "./destino/";

app.get('/getimage/information', function(req, res) {
    im.identify(srcImage, function(err, features){
        if (err) throw err;
        res.json({"images_data": features});
    });
});

app.get('/getimage/information/:specific', function(req, res) {
    var selectSpecific = decodeURIComponent(req.params.specific);
    selectSpecific = JSON.parse(selectSpecific).join("%");
    im.identify(['-format','%'+selectSpecific, srcImage], function(err, output){
        if (err) throw err;
        res.json({"images_data": output});
    });
});

app.get('/getimage/readmetadata', function(req, res) {
    im.readMetadata(srcImage, function(err, metadata){
        if (err) throw err;
        res.json({"metadata": metadata});
    });
});

app.get('/image/resize', function(req, res) {
    var optionsObj = {
        srcPath: srcImage,
        format: 'jpg',
        dstPath: desPath+"butterfly_lowquality25.jpg",
        quality: 0.6,
        width: 100
    };
    im.resize(optionsObj, function(err, stdout){
        if (err) throw err;
        res.json({
            "message": "Resized Image successfully"
        });
    });
});

app.get('/image/convert', function(req, res) {
    var optionsObj = [srcImage, '-resize', '100x100', desPath+'butterfly_small3.png'];
    im.convert(optionsObj, function(err, stdout){
        if (err) throw err;
        res.json({
            "message": "Converted Image successfully"
        });
    });
});

app.get('/image/crop', function(req, res) {
    var optionsObj = {
        srcPath: srcImage,
        dstPath: desPath+'butterfly_cropped.jpg',
        width: 200,
        height: 200,
        quality: 1,
        gravity: "North"
    };
    im.crop(optionsObj, function(err, stdout){
        if (err) throw err;
        res.json({
            "message": "cropped Image successfully"
        });
    });
});

app.listen(3000, () => {
    console.log('En el navegador entra a: http://localhost:3000')
})