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

function execute(query){
    if(!query)
        return null;

    query = query.toLowerCase();
    var calculate = query.substring(0,9);
    if(calculate != 'calculate')
        return null;
    
    var numbers = query.substring(9,query.length);
    try{
        return eval(numbers);
    }catch(err){
        return null;
    }

}


//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/', [
     function(session){
         var options = ['calculate','search','play'];
         var cards = options.map(function(item){ return createCard(session, item); });

         var messages = new builder.Message(session).attachments(cards).attachmentLayout('carousel');
         session.send(messages);
         //builder.Prompts.choice(session,'Hi there, wich option do you choose?',options);
        // session.beginDialog('/ensureProfile',session.userData.profile);
     },
     function(session, result){
         //session.userData.profile = result.response;
         //session.send('Hello %(name)s !',session.userData.profile);
         //session.beginDialog('/calculate');
         session.send('You choosed %s', result.response.entity);
     }
 ]);

function createCard(session, item){
    var card = new builder.ThumbnailCard(session);
    card.title(item);
    card.images([builder.CardImage.create(session, 'https://fbcdn-sphotos-c-a.akamaihd.net/hphotos-ak-xap1/v/t1.0-9/14568166_1622390904727332_3365595751762562420_n.png?oh=66949cba6fa4a6b5458b06e18ca52ce8&oe=58A45D5A&__gda__=1486356323_89c0ef37ccc6515735d96177bb1eba52')]);
    card.tap(new builder.CardAction.openUrl(session, 'http://saibimajdi.com'));
    return card;
}

// greating dialog
bot.dialog('/ensureProfile',[
    function(session, args, next){
        session.dialogData.profile = args || {};
        if(!session.dialogData.profile.name){
            builder.Prompts.text(session,"Hi there, what's your name ?");
        }else{
            next();
        }
    },
    function(session, result, next){
        if(result.response){
            session.dialogData.profile.name = result.response;
        }
        session.endDialogWithResult({ response : session.dialogData.profile});
    }
]);

// calculation dialog
bot.dialog('/calculate',[
    function(session, next){

         var introMessage;
         introMessage  = 'I\'m a bot designed & develped by Majdi! \n';
         introMessage += '\nI still learning a lot from Majdi, but now I can do those simple actions : \n';
         introMessage += '\n* calculate NUMBER + NUMBER (ex: calculate 1 + 5, calculate (10/5) * 2)';

         builder.Prompts.text(session, introMessage);
    },
    function(session, result){
        if(result.response){
              var query = result.response;
              var botResponse = execute(query);
              if(botResponse != null)
                 session.send("Humm it's " + botResponse);
              else
                session.send("Oh it's so difficult! I'm not smart enough :( ");
       }
       session.endDialog();
    }
]);
