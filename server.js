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
  //var connector = new builder.ConsoleConnector().listen();
  var bot = new builder.UniversalBot(connector);
  server.post('/api/messages/', connector.listen());
  
//=========================================================
// Bots functions
//=========================================================
/*
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
*/

//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/', [
     function(session){
         session.beginDialog('/ensureProfile',session.userData.profile);
     },
     function(session, result){
         session.userData.profile = result.response;
         session.send('Hello %(name)s',session.userData.profile);
     }
 ]);


bot.dialog('/ensureProfile',[
    function(session, args, next){
        session.dialogData.profile = args || {};
        if(!session.dialogData.profile.name){
            builder.Prompts.text(session,"What's your name ?");
        }else{
            next();
        }
    },
    function(session, result, next){
        if(result.response){
            session.dialogData.profile.name = result.response;
        }
        if(!session.dialogData.profile.company){
            builder.Prompts.text(session, "What company do you work for?");
        }else{
            next();
        }
    },
    function(session, result){
        if(result.response){
            session.dialogData.profile.company = result.response;
        }
        session.endDialogWithResult({ response : session.dialogData.profile});
    }
]);
