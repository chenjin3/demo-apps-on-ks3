/**
 * Created by Marlon on 15-12-25.
 */
const http = require('http');
const querystring = require('querystring');
const url = require('url');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const auth = require('../node_modules/ks3/lib/auth');

const ROOT = '/Users/web/jinjs/example';
const hostname = '127.0.0.1';
const port = 3000;

var responseHeader = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "PUT,POST,GET,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Authorization,kss-async-process,kss-notifyurl,x-kss-storage-class,Content-Type"
};

var ak = process.env.AK || 'your ks3 AK';
var sk = process.env.SK || 'your ks3 SK';
var bucketName = process.env.BUCKET || 'your bucket name';


function get(req, res) {
    var pathname = url.parse(req.url).pathname;
    var query =  url.parse(req.url,true).query;
    var paths = pathname.split('/');
    var dbname = paths[1];
    var collection = paths[2];
    if(paths.length == 4 ) {
        var uid = paths[3];
    }
    if(dbname == 'demoapp' && collection == 'image') { //处理数据库请求
        var start = query.start || 0;
        var limit = query.limit || 10;
        var sort = query.sort;
        try{
            findDocumentsFromDB(uid, start, limit, sort, res);
        }catch(e) {
            console.log(e);
        }
    }else {
        fs.readFile(path.join(ROOT, pathname), function (err, file) {
            if (err) {
                res.writeHead(404);
                res.end('找不到相关文件。 - -');
                return;
            }
            res.writeHead(200);
            res.end(file);
        });
    }
}
/**
 *
 * @param uid
 * @param start
 * @param limit
 * @param sort object  example: {createTime: -1}
 */
function findDocumentsFromDB(uid, start, limit,sort, res) {
    start = Number.parseInt(start);
    limit = Number.parseInt(limit);
    sort = JSON.parse(sort);
    var findDocuments = function(collection, callback) {
        // Find some documents
        if(uid) {
            collection.find({"owner.uid": uid}).sort(sort).skip(start).limit(limit).toArray(function(err, docs) {
                assert.equal(err, null);
                //assert.equal(2, docs.length);
                console.log("Found the following records");
                console.dir(docs);
                callback(docs);
            });
        }else {
            collection.find({}).sort(sort).skip(start).limit(limit).toArray(function(err, docs) {
                assert.equal(err, null);
                //assert.equal(2, docs.length);
                console.log("Found the following records");
                //console.dir(docs);
                callback(docs);
            });
        }
    }

    // Use connect method to connect to the Server
    MongoClient.connect(mongoDBUrl, function(err, db) {
        assert.equal(null, err);
        console.log("Connected correctly to server");
        // Get the documents collection
        var collection = db.collection('image');
        findDocuments(collection, function(docs) {
            db.close();

            res.writeHead(200);
            res.end(JSON.stringify(docs));
            console.log("return docs");
        });
    });

};

function hasBody(req) {
    return 'transfer-encoding' in req.headers || ('content-length' in req.headers && req.headers['content-length'] !== '0');
}


function mime(req) {
    var str = req.headers['content-type'] || '';
    return str.split(';')[0];
}


//POST请求 处理函数
function handle(req, res) {
    var pathname = url.parse(req.url).pathname;
    var paths = pathname.split('/');
    var controller = paths[1] || 'index';
    var action = paths[2] || 'index';
    var args = paths.slice(3);
    if( handles[controller] && handles[controller][action]) {
        handles[controller][action].apply(null, [req,res].concat(args));
    }else{
        res.writeHead(501);
        res.end('找不到响应控制器');
    }
}

var handles = {};
handles.index = {};

var MongoClient = require('mongodb').MongoClient
    , assert = require('assert');

// Connection URL
var mongoDBUrl = 'mongodb://localhost:27017/demoapp';


function insertDocument2DB(document, res) {
    // Use connect method to connect to the Server
    MongoClient.connect(mongoDBUrl, function(err, db) {
        assert.equal(null, err);
        console.log("Connected correctly to server");

        // Insert a single document
        db.collection('image').insertOne(document, function(err, r) {
            assert.equal(null, err);
            assert.equal(1, r.insertedCount);
            db.close();

            res.writeHead(200);
            res.end(JSON.stringify({"result":true}));
            console.log("return result true");
        });
    });

}

//接收ks3回调
handles.index.index = function(req,res,arg1,arg2) {
    //res.writeHead(200);
    //res.end(arg1 + arg2);
    try{
        if(req.body) {
            var objectKey = req.body.objectKey;
            var url = 'http://' + bucketName + '.ks3-cn-beijing.ksyun.com/' + objectKey;
            var createTime = req.body.createTime;
            var uid = req.body.uid;
            var nickname = decodeURIComponent(req.body.nickname);
            var icon = req.body.icon;
            var documentItem = {
                objectKey: objectKey,
                url: url,
                createTime :createTime,
                owner : {
                    uid: uid,
                    nickname: nickname,
                    icon: icon
                }
            };
            insertDocument2DB(documentItem, res);
        }else {
            processCallbackFailed(res);
        }
    }catch(e) {
        processCallbackFailed(res);
    }
}

function processCallbackFailed(res) {
    res.writeHead(200);
    res.end(JSON.stringify({"result":false}));//给客户端返回一个json格式的数据
    console.log("return result false");
}

handles.index.token = function calcToken(req, res) {
    if(req.body)  {
        var request = {
            uri: 'http://ks3-cn-beijing.ksyun.com/' + bucketName + '/' + req.body.key,
            method: req.body.method,
            date:'',
            body: '',
            type: req.body.contentType,
            headers: req.body.headers,
            resource: '/' + bucketName + '/' + req.body.key
        };

        var token = auth.generateAuth(ak, sk, request, '');
        res.writeHead(200);
        res.end(token);
    }else{
        res.writeHead(400);
        res.end('缺少参数');
    }
}

handles.pay = {};

handles.pay.createCharge = function createCharge(req,res){
    var pingpp = require('pingpp')('sk_test_4m1C8OfbfLqLS4qvX9zbHC4S');
    var extra = null;
    switch (req.body.channel){
        case 'alipay_wap':
            extra = {success_url:'http://ks3.ksyun.com/', cancel_url:'http://ks3.ksyun.com/'};
            break;
        case 'upacp_wap':  //新银联
            extra = {result_url:'http://ks3.ksyun.com/'};
            break;
        case 'upmp_wap':  //老银联
            extra = {result_url:'http://ks3.ksyun.com/'};
            break;
        case 'wx_pub':
            break;
        default :
    }

    pingpp.charges.create({
        subject: "测试H5支付",
        body: "一只萌物",
        amount: req.body.amount,
        order_no: req.body.order_no,
        channel: req.body.channel,
        currency: "cny",
        client_ip: "192.168.31.240",
        app: {id: "app_iLWzr9iHybvTWjXL"},
        extra: extra
    }, function(err, charge) {
        if(err){
            console.log(err);
            res.writeHead(500,responseHeader);
            res.end('无法获得支付凭据Charge对象: ' + err.message);
            return;
        }
        res.writeHead(200,responseHeader);
        res.end(JSON.stringify(charge));

    });
};

function post(req, res) {
    if (hasBody(req)) {

        var buffers = [];
        req.on('data', function (chunk) {
            buffers.push(chunk);
        }).on('end', function () {
            req.rawBody = Buffer.concat(buffers).toString();
            console.log('postData: ' + req.rawBody);


            if (mime(req) == 'application/json') {
                try {
                    req.body = JSON.parse(req.rawBody);
                    handle(req, res);
                } catch (e) {
                    res.writeHead(400);
                    req.end('Invalid JSON');
                    return;
                }
            } else if (mime(req) === 'application/xml') {
            }
            else if (mime(req) === 'multipart/form-data') {
            }
        });
    } else {
        handle(req, res);
    }
}

function put(req, res) {
    var auth = req.headers['authorization'];
    var async_process = req.headers['kss-async-process'];
    var notifyurl = req.headers['kss-notifyurl'];
    console.log('adp: ' + async_process + '\nnotifyUrl: ' + notifyurl);
    if(auth !== 'KSS ' + AK){
        res.writeHead(403, responseHeader);
        res.end('Authorization not match');
        return;
    }
    if (hasBody(req)) {
        if (mime(req) === 'multipart/form-data') {
            var form = new formidable.IncomingForm();
            form.parse(req, function (err, fields, files) {
                req.body = fields;
                req.files = files; // don't forget to delete all req.files when done
                next(req, res);
            });
        }else{
            res.writeHead(400, responseHeader);
            res.end('mime type not match');
        }
    }else{
        res.writeHead(400, responseHeader);
        res.end('not found body');
    }
};

function next(req, res) {
    var bucketName = url.parse(req.url).pathname.split('/')[1];
    req.query = url.parse(req.url, true).query;

    var client = new KS3(AK, SK, bucketName);
    var key = req.body.key;
    var filePath = req.files.file.path;
    var outerRes = res;
    client.object.put({
            Bucket: bucketName,
            Key: key,
            filePath: filePath
        },
        function (err, data, res) {
            if (err) {
                console.log("Error in put : " + err.message);
                return;
            }
            console.log(JSON.stringify(res));
            if (res.status === 200 && res.statusCode === 200) {
                outerRes.writeHead(200, responseHeader);

                //计算处理之后的文件的signature
                var resource = '/' + util.encodeKey('imgWaterMark-' + key);
                var getReq = {
                    method: 'GET',
                    date: req.query.t,
                    uri:  'http://' + bucketName + '.kss.ksyun.com' + resource,
                    resource: '/' + bucketName + resource,
                    headers: {}
                };
                var signature = auth.generateToken(SK, getReq);
                console.log('signature:' + signature);
                outerRes.end(signature);

                //下载加过水印的图片到assets目录
                setTimeout(getAdpResult, 2000);
                function getAdpResult() {
                    client.object.get({
                        Bucket: bucketName,
                        Key: 'imgWaterMark-' + key
                    }, function (err, data, res, originData) {
                        if (err) {
                            console.log("Error in get : " + err.message);
                            return;
                        }
                        var newFileName = path.join(__dirname, 'assets/imgWaterMark-' + key);
                        fs.writeFileSync(newFileName, originData);
                    });
                }
            }
        },
        {
            'kss-async-process': req.headers['kss-async-process'],
            'kss-notifyurl': req.headers['kss-notifyurl'],
            'x-kss-storage-class' : req.headers['x-kss-storage-class']
        });
}


//启动服务器
var server = http.createServer(function (req, res) {
    //console.log( req.headers);

    switch (req.method) {
        case 'OPTIONS':
            res.writeHead(200, responseHeader);
            res.end();
            /*让options请求快速返回*/
            break;
        case 'POST':
            post(req, res);
            break;
        case 'PUT':
            put(req, res);
            break;

        case 'GET':
        default :
            get(req, res);
    }
}).listen(port, hostname, function () {
    console.log('Server running at http://' + hostname + ':' + port + '/');
});

