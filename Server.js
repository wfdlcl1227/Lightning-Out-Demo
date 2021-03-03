var express = require('express'),
    http = require('http'), 
    request = require('request'),
    bodyParser = require('body-parser'),
    app = express();
	
var https = require('https');
var fs = require('fs'),
privateKey = fs.readFileSync('./key.pem').toString('utf8'),
jwt = require("salesforce-jwt-bearer-token-flow");
 
	
var logFmt = require("logfmt");

app.use(express.static(__dirname + '/client')); 

app.use(bodyParser.json());  

app.set('port', process.env.PORT || 8080);

/*Allow CORS*/
app.use(function(req, res, next) {
	 
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token,Authorization,X-Authorization'); 
	res.setHeader('Access-Control-Allow-Methods', '*');
	res.setHeader('Access-Control-Expose-Headers', 'X-Api-Version, X-Request-Id, X-Response-Time');
	res.setHeader('Access-Control-Max-Age', '1000');
	  
	next();
});



app.all('/proxy',  function(req, res, next) { 
    
    var url = req.header('SalesforceProxy-Endpoint');  
    request({ url: url, method: req.method, json: req.body, 
                    headers: {'Authorization': req.header('X-Authorization'), 'Content-Type' : 'application/json'}, body:req.body }).pipe(res);    
    
});
 
app.get('/' ,  function(req,res,next) {
    loginJWT(res);
} ); 

app.get('/index*' ,  function(req,res,next) {
    res.sendfile('views/index.html');
} );  
 
app.get('/oauthcallback.html' ,  function(req,res,next) {
    res.sendfile('views/oauthcallback.html');
} ); 

app.get('/Main*' ,   function(req,res,next) {
    loginJWT(res);
} );
 

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

let loginJWT = (res)=>{
    var token = jwt.getToken({
        iss: "3MVG97quAmFZJfVxWKnAvwSSZmNlDRE3_6Qwn1WK5g9juYM3jaINFc3BX9_XGU_LeYSo4mqbgIYJH8lvevSvK",
        sub: "wfdlcl1227@126.com.analytics",
        aud: "https://login.salesforce.com",
        privateKey: privateKey,
    },
    (err, token)=>{

        res.cookie('AccToken', token.access_token, {maxAge: 60*1000});
        res.cookie('APIVer', 'v37.0', {maxAge: 60*1000});
        res.cookie('InstURL', token.instance_url, {maxAge: 60*1000});
        res.cookie('idURL', token.id, {maxAge: 60*1000});
        strngBrks = token.id.split('/');
        res.cookie("LoggeduserId",  strngBrks[strngBrks.length - 1]) ;
        res.sendfile('views/main.html');
    }
    );    
};

var options = {
    key: fs.readFileSync('./key.pem', 'utf8'),
    cert: fs.readFileSync('./server.crt', 'utf8')
};

https.createServer(options, app).listen(8081);
console.log("Server listening for HTTPS connections on port ", 8081);