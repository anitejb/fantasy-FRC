var Discord = require('discord.io');
var auth = require('./auth.json');
var request = require('request');

var prefix = '!';

// Initialize Discord Bot
var bot = new Discord.Client({
    token: auth.token,
    autorun: true
});

// Display Console Load Confirmation
bot.on('ready', function (event) {
    console.log('Connected');
    console.log('Logged in as: ');
    console.log(bot.username + '(' + bot.id + ')');
});

// Read Messages
bot.on('message', function (user, userID, channelID, message, event) {

    // Bot Call Methods
    // It will listen for messages that will start with prefix

    if (message.substring(0, 1) == prefix) {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
        args = args.splice(1);

        switch (cmd) {
            // Ping
            // Returns 'Pong!'
            case 'ping':
                bot.sendMessage({
                    to: channelID,
                    message: 'Pong!'
                });
                break;
            // Meme
            // Returns the previous message, converted into meme speak (good morning => gOoD MoRnInG)
            case 'meme':
                bot.getMessages({
                    channelID: channelID,
                    limit: 2
                }, function (err, messageArr) {
                    var prevMessage = messageArr[1].content
                    bot.sendMessage({
                        to: channelID,
                        message: meme(prevMessage)
                    });
                });
                break;
            // Prefix
            // Allows users to change the character that calls the bot (default is `!`)
            case 'prefix':
                if (args[0] == undefined || args[0].length > 1) {
                    bot.sendMessage({
                        to: channelID,
                        message: 'Prefixes can only be a single character.'
                    });
                } else {
                    prefix = args[0];
                    bot.sendMessage({
                        to: channelID,
                        message: 'Prefix successfully reset to `' + prefix + '`.'
                    });
                }
                break;
            case 'TBATeam':
                if (args[0] == undefined) {
                    bot.sendMessage({
                        to: channelID,
                        message: 'To use this command, type `' + prefix + 'TBATeam <team_number>`.'
                    });
                } else {
                    // Set up TBA request
                    var options = {
                        url: 'http://www.thebluealliance.com/api/v3/team/frc' + args[0],
                        headers: {
                            'X-TBA-Auth-Key': auth.tbaKey
                        }
                    }
                    // Access TBA
                    request(options, function (error, response, body) {
                        body = JSON.parse(body);
                        if (!error && response.statusCode == 200) {
                            var teamData = 
                            '__**Team Data**__' + '\n' +
                            'Team Name: ' + body.nickname || 'not found' + '\n' +
                            'Team Number: ' + body.team_number  || 'not found' + '\n' +
                            'City: ' + body.city || 'not found' + '\n' +
                            'State/Province: ' + body.state_prov || 'not found' + '\n' +
                            'Zip Code: ' + body.postal_code || 'not found' + '\n' +
                            'Country: ' + body.country || 'not found' + '\n' +
                            'Rookie Year: ' + body.rookie_year || 'not found' + '\n' +
                            'Motto: ' + body.motto || 'not found' + '\n' +
                            'Website: ' + body.website || 'not found'
                            // Send Message with Team Data
                            bot.sendMessage({
                                to: channelID,
                                message: teamData
                            });
                        } else {
                            bot.sendMessage({
                                to: channelID,
                                message: 'Invalid Team Number.'
                            });
                        }
                    });
                }
                break;
            // Help
            // Displays a list of commands a user can select
            case 'help':
                bot.sendMessage({
                    to: channelID,
                    message: 'Hi! I\'m Fantasy FRC, a pretty cool bot that helps out with FRC! Here\'s what I can do: \n\n' +
                    '`' + prefix + 'prefix <new_prefix>`\n' + 
                    'Allows users to change the character that calls the bot (default is `!`)\n\n' +
                    '`' + prefix + 'TBATeam <team_number>`\n' +
                    'Allows users to get detailed information on any FRC team, sourced from The Blue Alliance\n'
                });
                break;
            // Test
            // Prints 'It works' in the console
            case 'test':
                console.log('It works!')
                break;
        }
    }

    // Background Methods
    // It will execute on specific events (not a call from prefix)

    // Going to War
    // if (checkCaps(message)) {
    //     bot.addReaction({
    //         channelID: channelID,
    //         messageID: event.d.id,
    //         reaction: '⚔'
    //     });
    // }

});

// Functions

// Converts inputString to meme speak (good morning => gOoD MoRnInG)
var meme = function (inputString) {
    var memeString = '';
    for (var i = 0; i<inputString.length; i++) {
        memeString += i % 2 == 0 ? inputString[i].toLowerCase() : inputString[i].toUpperCase();
    } 
    return memeString;
}

// Checks to see if inputString is all caps
var checkCaps = function (inputString) {
    return !/[^A-Z\s]/.test(inputString);
}

// Checks to see if a message contains a string (ignoring before and after)
// string to be tested must have stars before and after
var looseMatch = function (msg, rule) {
    return new RegExp("^" + rule.split("*").join(".*") + "$").test(msg);
}