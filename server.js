var restify = require('restify');
var builder = require('botbuilder');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

var bot = new builder.UniversalBot(connector);
server.post('/api/messages/', connector.listen());

//=========================================================
// Bots functions
//=========================================================

function execute(query){
    if(!query)
        return null;

    query = query.toLowerCase();
    var calculate = query.substring(0,9);
    if(calculate != 'calculate')
        return null;
    
    var numbers = query.substring(9,query.length);

    var num1 = numbers.substring(0,numbers.indexOf("+"));
    var num2 = numbers.substring(numbers.indexOf("+")+1,numbers.length);
    
    if(isNaN(num1) || isNaN(num2))
        return null;

    num1 = parseInt(num1.trim());
    num2 = parseInt(num2.trim());
    
    if(Number.isInteger(num1) && Number.isInteger(num2)){
        return num1 + num2;
    }
    
    return null;
}


//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/', [
    function (session) {
        if(!session.userData.name){
            builder.Prompts.text('Hi there, what\'s your name ?');
        }
        else{
            next({response : session.userData.name});
        }
    },
    function(session,result){
        var name = result.response;
        session.send('nice to meet you %s',name);
        var introMessage = 'I\'m a bot designed & develped by Majdi!';
        introMessage += '\nI still learning a lot from Majdi, but now I can do those actions only : ';
        introMessage += '\n * calculate NUMBER + NUMBER (ex: calculate 1 + 5)';
    }
    ,function(session,result){
        if(result.response){
            var query = result.response;
            var botResponse = execute(query);
        }
    }
]);
