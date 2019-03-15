var Discord = require('discord.io');
var auth = require('./auth.json');
var request = require('request');
var pickList = {};
var teamList = "";

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
    console.log(bot.username + ' (' + bot.id + ')');
});

// Read Messages
bot.on('message', function (user, userID, channelID, message, event) {

    // Bot Call Methods
    // Listens for messages that will start with prefix

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
                            'Team Name: ' + body.nickname + '\n' +
                            'Team Number: ' + body.team_number + '\n' +
                            'City: ' + body.city + '\n' +
                            'State/Province: ' + body.state_prov + '\n' +
                            'Zip Code: ' + body.postal_code + '\n' +
                            'Country: ' + body.country + '\n' +
                            'Rookie Year: ' + body.rookie_year + '\n' +
                            'Motto: ' + body.motto + '\n' +
                            'Website: ' + body.website
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
            case 'setEvent':
                if (args[0] == undefined) {
                    bot.sendMessage({
                        to: channelID,
                        message: 'To use this command, type `' + prefix + 'setEvent <event_id>`.'
                    });
                } else {
                    // Set up TBA request
                    var options = {
                        url: 'http://www.thebluealliance.com/api/v3/event/' + args[0] + '/teams/simple',
                        headers: {
                            'X-TBA-Auth-Key': auth.tbaKey
                        }
                    }
                    // Access TBA
                    request(options, function (error, response, body) {
                        body = JSON.parse(body);
                        if (!error && response.statusCode == 200) {
                            for (i = 0; i < body.length; i++) {
                                teamList += body[i].team_number + '\n';
                            }
                            // Send Message with Team List
                            bot.sendMessage({
                                to: channelID,
                                message: teamList
                            });
                        } else {
                            bot.sendMessage({
                                to: channelID,
                                message: 'Invalid Event ID.'
                            });
                        }
                    });
                }
                break;
            case 'checkTeams':
                bot.sendMessage({
                    to: channelID,
                    message: teamList
                });
                break;
            case 'setPlayers':
                args = shuffle(args);
                for (i = 0; i < args.length; i++) {
                    pickList[args[i].substring(2, args[i].length - 1)] = [0, 0, 0];
                }
                bot.sendMessage({
                    to: channelID,
                    message: JSON.stringify(pickList)
                });
                break;
            case 'pick':
                if (args[0] == undefined) {
                    bot.sendMessage({
                        to: channelID,
                        message: 'Select a team!'
                    });
                } else {
                    if (pickList[userID][0] == 0) {
                        pickList[userID][0] = args[0];
                        teamList = teamList.substring(0, teamList.indexOf(args[0])) + teamList.substring(teamList.indexOf(args[0]) + args[0].length + 1);
                    } else if (pickList[userID][1] == 0) {
                        pickList[userID][1] = args[0];
                        teamList = teamList.substring(0, teamList.indexOf(args[0])) + teamList.substring(teamList.indexOf(args[0]) + args[0].length + 1);
                    } else if (pickList[userID][2] == 0) {
                        pickList[userID][2] = args[0];
                        teamList = teamList.substring(0, teamList.indexOf(args[0])) + teamList.substring(teamList.indexOf(args[0]) + args[0].length + 1);
                    }
                }
                bot.sendMessage({
                    to: channelID,
                    message: JSON.stringify(pickList)
                });
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

var shuffle = function (array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
}