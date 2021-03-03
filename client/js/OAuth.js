
$("#prodBtn").click(prodLogin);
$("#sandBtn").click(sandLogin);

var apiVersion = 'v37.0',
    clientId = '3MVG97quAmFZJfVxWKnAvwSSZmNlDRE3_6Qwn1WK5g9juYM3jaINFc3BX9_XGU_LeYSo4mqbgIYJH8lvevSvK',
    loginUrl = 'https://test-chris-dev-ed.my.salesforce.com/',
    redirectURI = "https://web-app-connect-to-salesforce.herokuapp.com/oauthcallback.html",
    proxyURL = 'https://web-app-connect-to-salesforce.herokuapp.com/proxy/' ;
 

function prodLogin()
{
	loginUrl = 'https://test-chris-dev-ed.my.salesforce.com/'; 
    login();
}

function sandLogin()
{
    loginUrl = 'https://test-chris-dev-ed.my.salesforce.com/';
    login();
}
function login() {
    var url = loginUrl + 'services/oauth2/authorize?display=popup&response_type=token' +
        '&client_id=' + encodeURIComponent(clientId) +
        '&redirect_uri=' + encodeURIComponent(redirectURI);
    popupCenter(url, 'login', 700, 600);
}


}

function oauthCallback(response) {
    if (response && response.access_token) { 
        console.log(response);
        $.cookie("AccToken",response.access_token ) ;
        $.cookie("APIVer", apiVersion) ;
        $.cookie("InstURL",  response.instance_url) ; 
        $.cookie("idURL",  response.id) ;
        
		strngBrks = response.id.split('/');
		$.cookie("LoggeduserId",  strngBrks[strngBrks.length - 1]) ;
		
        window.location = 'Main';
    } else {
        alert("AuthenticationError: No Token");
    }
}

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

function popupCenter(url, title, w, h) {
    // Handles dual monitor setups
    var parentLeft = window.screenLeft ? window.screenLeft : window.screenX;
    var parentTop = window.screenTop ? window.screenTop : window.screenY;
    var left = parentLeft + (window.innerWidth / 2) - (w / 2);
    var top = parentTop + (window.innerHeight / 2) - (h / 2);
    return window.open(url, title, 'width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
}
