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
// menu content
var menuContent = {
    "education":"Majdi is doing a Master degree in Engineering in Computer Systems, he got his Bachelor degree in 2015 from Faculty of Sciences of Monastir.",
    "experiences":"Humm, I can't tell you all Majdi's experiences but here is some of them.\nMajdi is a Microsoft Student Partner for the 3rd year, he did an internship at Microsoft Tunisia. Last summer he worked as a FullStack developer at Ernst.",
    "friends":"Majdi has a lot of friends and you are one of them because you are discussing with me :D",
    "sport":"Majdi was Hand ball player with Sidi Bouzid Hanball Team for 5 years (2003 - 2008)!",
    "dream":"Majdi dreams to build his own company (MacdoW) with his brothers (Chames, Dhia and Oussama)",
    "weaknesses":"Majdi smokes a lot :( Yes this is a big problem!",
    "strengths":"He is a dreamer, curious and always wants to learn more about new technologies. \nFor this reason he built me :D"
};

// menu options
var menuOptions = ["education","experiences","friends","sport","dream","weaknesses","strengths","secrets","website"];

//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/', [
     function(session){
         //var options = ['calculate','search','play'];
         //var cards = options.map(function(item){ return createCard(session, item); });

         //var messages = new builder.Message(session).attachments(cards).attachmentLayout('carousel');
         //session.send(messages);
         //builder.Prompts.choice(session,'Hi there, wich option do you choose?',options);
         //session.beginDialog('/ensureProfile',session.userData.profile);
         
         session.beginDialog('/ensureProfile',session.userData.profile);
     },
     function(session, result){
         //session.userData.profile = result.response;
         //session.send('Hello %(name)s !',session.userData.profile);
         //session.beginDialog('/calculate');
         session.userData.profile = result.response;
         session.send("Hi %s! Majdi tells me a lot about you :D", session.userData.profile.name);
         session.beginDialog('/menu');
     }
 ]);

function createCard(session){
    var card = new builder.ThumbnailCard(session);
    card.title("Majdi Saibi website");
    card.subtitle("Visit Majdi's website to know more about him!");
    card.images([builder.CardImage.create(session, 'http://saibimajdi.com/images/shared.png')]);
    card.tap(new builder.CardAction.openUrl(session, 'http://saibimajdi.com'));
    return card;
}
// menu dialog 
bot.dialog('/menu',[
    function(session){
        builder.Prompts.choice(session, "What do you want to know about Majdi ?", menuOptions);
    },
    function(session, result){
        if(result.response){
            if(result.response.entity == "website"){
                var messages = new builder.Message(session).attachments([createCard(session)]).attachmentLayout('carousel');
                session.send(messages);
                builder.Prompts.choice(session,"Need more ?",["back to menu"]);
            }else{
                if(result.response.entity == "secrets"){
                    session.beginDialog('/secrets');
                }else{
                    if(menuOptions.indexOf(result.response.entity) >= 0){
                        builder.Prompts.choice(session,menuContent[result.response.entity],["back to menu"]);
                    }else{
                        session.send("Wrong choice :/ ");
                        session.endDialog();
                        session.beginDialog('/menu');
                    }
                }
            }
        }else{
            session.endDialog();
        }
    },
    function(session, result){
        if(result.response.entity){
                session.endDialog();
                session.beginDialog('/menu');
                return;
        }
    }
]);

// secrets dialog
bot.dialog('/secrets',[
    function(session){
        builder.Prompts.choice(session, "Sorry, I don't have the permission to do that only if you have a password from Majdi! Do you have a password?",["yes","no"]);
    },
    function(session, result){
        if(result.response.entity){
            if(result.response.entity == "yes"){
                builder.Prompts.text(session, "Please enter the correct password!");
            }else{
                builder.Prompts.choice(session,"Sorry, I can't tell you any Majdi's secret!",["back to menu"]);
            }
        }
    },
    function(session, result){
            if(result.response == "MajdiPass"){
                session.send('Majdi has a girlfriend, he loves her so much and they will be married ASAP :D <3 Please do not tell anyone!');
            }else{
                session.send('No, wrong password!');
            }
            session.endDialog();
            session.beginDialog('/menu');
    }
]);


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
        session.endDialogWithResult({ response : session.dialogData.profile });
     }
]);
