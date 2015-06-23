// Your domain name
var address = "http://twitter-oauthtool.herokuapp.com";

var OAuth = require('oauth');
var express = require('express');
var app = express();
app.use(require('body-parser')());
app.use(express.static('public'));
var session = require('cookie-session')
app.use(session({
    keys: ['secret1', 'secret2']
}))
require('http').createServer(app).listen(process.env.PORT || 3000, function () { });
app.get("/", function (req, res) {
    var html = '<head><title>Twitter application access token generator</title></head><body>' +
        '<form action="/" method="post">' +
        '<Font Size=16>Twitter application access token generator</font><br><br>' +
        'Application consumer key : ' +
        '<input type="text" name="oauth_consumer_key"  style="width:210px;"/>' +
        '<br>' +
        'Application consumer secret : ' +
        '<input type="text" name="oauth_signature" style="width:390px;" />' +
        '<br>' +
        '<br>' +
        '<button type="submit">Submit</button>' +
        '</form></body>';

    res.send(html);

});
app.post('/', function (req, res) {
    new OAuth.OAuth(
        'https://api.twitter.com/oauth/request_token',
        'https://api.twitter.com/oauth/access_token',
        req.body.oauth_consumer_key,
        req.body.oauth_signature,
        '1.0A',
        addres + "/auth/twitter/callback",
        'HMAC-SHA1'
    ).getOAuthRequestToken(function (error, oauth_token, oauth_token_secret, results) {
        if (error) {
            res.send(error);
        }
        else {
            req.session.oauth = {
                oauth_consumer_key: req.body.oauth_consumer_key,
                oauth_signature: req.body.oauth_signature,
                token: oauth_token,
                token_secret: oauth_token_secret
            };
            res.redirect('https://twitter.com/oauth/authenticate?oauth_token=' + oauth_token);
        }
    });
});
app.get('/auth/twitter/callback', function (req, res, next) {
    if (req.session.oauth) {
        req.session.oauth.verifier = req.query.oauth_verifier;
        var oauth_data = req.session.oauth;

        // Maybe regeneration is born problem soon
        var oa = new OAuth.OAuth(
        'https://api.twitter.com/oauth/request_token',
        'https://api.twitter.com/oauth/access_token',
        req.session.oauth.oauth_consumer_key,
        req.session.oauth.oauth_signature,
        '1.0A',
        addres + "/auth/twitter/callback",
        'HMAC-SHA1'
        ).getOAuthAccessToken(
        oauth_data.token,
        oauth_data.token_secret,
        oauth_data.verifier,
        function (error, oauth_access_token, oauth_access_token_secret, results) {
            if (error) {
                res.send(error);
            }
            else {
                var html = '<head><title>Your access token generated!</title></head><body>' +
                    '<form action="/" method="post">' +
                    '<Font color=gray>Your access token : </font>' + oauth_access_token +
                    '<br>' +
                    '<Font color=gray>Your access token secret : </font>' + oauth_access_token_secret +
                    '<br>' +
                    '<br>' +
                    '<a href=' + addres + '>Go home</a>' +
                    '</form></body>';
                res.send(html);
            }
        }
        );
    }
    else {
        res.redirect(addres);
    }
});