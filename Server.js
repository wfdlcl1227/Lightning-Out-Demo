var express = require('express'),
    http = require('http'), 
    request = require('request'),
    bodyParser = require('body-parser'),
    app = express(),
    fetch=require('node-fetch'),
    sha1 = require('sha1'),
    urlencode = require('urlencode');
	
var https = require('https');
var fs = require('fs'),
privateKey = fs.readFileSync('./key.pem').toString('utf8'),
jwt = require("salesforce-jwt-bearer-token-flow");
 
var wx_config = {
    token_url:'https://qyapi.weixin.qq.com/cgi-bin/gettoken',
    ticket_url:'https://qyapi.weixin.qq.com/cgi-bin/get_jsapi_ticket',
    //ticket_url:"https://qyapi.weixin.qq.com/cgi-bin/ticket/get",
    corp_id:'ww280a3271671efde1',
    corp_secret:'_O31adLntyCr6QUI5j5WD0L39O-tSVY9ltXyAihUqAo',
    access_token: '',
    ticket: '',
    host_url:'https://web-app-connect-to-salesforce.herokuapp.com/'

};
	
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
    console.log('===> ' + req.path);
	//getSFToken(res);
    //getWXToken(res);
    
} ); 

app.get('/index*' ,  function(req,res,next) {
    res.sendfile('views/index.html');
} );  
 
app.get('/oauthcallback.html' ,  function(req,res,next) {
    res.sendfile('views/oauthcallback.html');
} ); 

app.get('/Main*' ,   function(req,res,next) {
	console.log('===> ' + req.path);
    //getSFToken(res);
} );
 
app.get('/WW_verify_e6WJnTuiAA4sEwBY.txt' ,   function(req,res,next) {
    res.sendfile('./WW_verify_e6WJnTuiAA4sEwBY.txt');
} );

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

let getSFToken = (res)=>{
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
        res.sendfile('views/Main.html');
    }
    );    
};


async function getWXToken(res){
    //get token
    var url = wx_config.token_url;
    url += '?corpid=' + wx_config.corp_id;
    url += '&corpsecret=' + wx_config.corp_secret;    

    let response = await fetch(url); // 解析 response header
    let result = await response.json(); // 将 body 读取为 json
    wx_config.access_token = result.access_token;
    getWXTicket(res);

};

async function getWXTicket(res){
    //get token
    var url = wx_config.ticket_url;
    url += '?access_token=' + wx_config.access_token;//+'&type=agent_config';

    let response = await fetch(url); // 解析 response header
    let result = await response.json(); // 将 body 读取为 json
    wx_config.ticket = result.ticket;
    getJSSDKSign(res);
};


function getJSSDKSign(res){
    let wx_nonce = sha1(new Date());
    let wx_timestamp=parseInt(new Date().getTime() / 1000)
    let wx_sign = "jsapi_ticket=" + wx_config.ticket + "&noncestr=" + wx_nonce + "&timestamp=" + wx_timestamp + "&url=" + wx_config.host_url;
    res.cookie('wxticket', wx_config.ticket, {maxAge: 60*1000});
    res.cookie('wxsign', sha1(wx_sign), {maxAge: 60*1000});
    res.cookie('wxnonce', wx_nonce, {maxAge: 60*1000});
    res.cookie('wxtimestamp', wx_timestamp, {maxAge: 60*1000});
    res.cookie('wxhurl', wx_config.host_url, {maxAge: 60*1000});
    res.cookie('wxall', wx_sign, {maxAge: 60*1000});
    res.sendfile('views/Main.html');
};

var options = {
    key: fs.readFileSync('./key.pem', 'utf8'),
    cert: fs.readFileSync('./server.crt', 'utf8')
};

https.createServer(options, app).listen(8081);
console.log("Server listening for HTTPS connections on port ", 8081);
