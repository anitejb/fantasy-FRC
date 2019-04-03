var Discord = require('discord.io');
var auth = require('./auth.json');
var request = require('request');
var pickList = {};
var pickListDisplay = '';
var teamList = [];
var teamListDisplay = '';
var currentPlayer = '';
var currentPlayerIndex = 0;
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
            // Prefix
            // Allows users to change the character that calls the bot (default is `!`)
            // Requires new desired prefix character
            case 'prefix':
                if (args[0] == undefined || args[0].length > 1) { // No arguments OR prefix longer than one character
                    bot.sendMessage({
                        to: channelID,
                        message: 'Prefixes must be a single character.'
                    });
                } else {
                    prefix = args[0];
                    bot.sendMessage({
                        to: channelID,
                        message: 'Prefix successfully reset to `' + prefix + '`.'
                    });
                }
                break;
            // TBATeam
            // Allows users to access information about Teams, sourced from The Blue Alliance
            // Requires Team Number
            case 'TBATeam':
                if (args[0] == undefined) { // No arguments
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
                            // Send message with TeamData
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

            // TEAMS SETUP BEGIN

            // SetEvent
            // Allows users to select an event, and populates TeamList with teams from event
            // Requires FIRST Event Code (ie, FMA Mt. Olive 2019 = 2019njfla)
            case 'setEvent':
                if (args[0] == undefined) { // No arguments
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
                                teamList[i] = body[i].team_number;
                            }
                            // Send message with TeamList
                            compileTeamListDisplay();
                            bot.sendMessage({
                                to: channelID,
                                message: teamListDisplay
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
            // CheckTeams
            // Displays the teams from TeamList
            case 'checkTeams':
                // Send message with TeamList
                compileTeamListDisplay();
                bot.sendMessage({
                    to: channelID,
                    message: teamListDisplay
                });
                break;
            
            // TEAMS SETUP END
            // PLAYER SETUP BEGIN

            // SetPlayers
            // Populates the members playing the draft into PickList
            // Requires @user for each player separated by spaces (ie, !setPlayers @Qwerty253#9647 @testUser#9999)
            case 'setPlayers':
                // Randomize players
                args = shuffle(args);
                // Initialize PickList with players
                for (i = 0; i < args.length; i++) {
                    bot.getMember({
                        serverID: event.d.guild_id,
                        userID: args[i].substring(3, args[i].length - 1)
                    }, function (err, memberInfo) {
                        pickList[memberInfo.nick] = ['0', '0', '0'];
                    });
                }
                // DO NOT PLACE CODE HERE (callbacks aghhhhh)
                break;
            // showDraft
            // Displays the players and respective picks from PickList
            case 'showDraft':
                // Send message with PickList
                compilePickListDisplay();
                bot.sendMessage({
                    to: channelID,
                    message: pickListDisplay
                });
                break;
            // CheckCurrentPlayer
            // Displays the player whose turn it is
            case 'checkCurrentPlayer':
                // Set CurrentPlayer to the appropriate player in PickList
                currentPlayer = Object.keys(pickList)[currentPlayerIndex];
                // Send message with CurrentPlayer
                bot.sendMessage({
                    to: channelID,
                    message: currentPlayer
                });
                break;

            // PLAYER SETUP END

            // Pick
            // Allows users to pick a team, and adds it to their list
            case 'pick':
                // Set CurrentPlayer to the appropriate player in PickList
                currentPlayer = Object.keys(pickList)[currentPlayerIndex];
                
                if (args[0] == undefined) { // No arguments
                    bot.sendMessage({
                        to: channelID,
                        message: 'Select a team!'
                    });
                } else if (event.d.member.nick !== currentPlayer) { // Not user's turn
                    bot.sendMessage({
                        to: channelID,
                        message: 'Not your turn!'
                    });
                } else if (!teamListDisplay.includes(args[0])) { // Desired team not available
                    bot.sendMessage({
                        to: channelID,
                        message: 'Team does not exist/is not competing here/has already been chosen!'
                    });
                } else {
                    if (pickList[event.d.member.nick][0] == 0) {
                        pickList[event.d.member.nick][0] = args[0];
                    } else if (pickList[event.d.member.nick][1] == 0) {
                        pickList[event.d.member.nick][1] = args[0];
                    } else if (pickList[event.d.member.nick][2] == 0) {
                        pickList[event.d.member.nick][2] = args[0];
                    } else { // probably never going to execute?
                        bot.sendMessage({
                            to: channelID,
                            message: 'You have already made 3 picks!'
                        });
                        break;
                    }
                
                    // Acknowledge pick with thumbsup emoji
                    bot.addReaction({
                        channelID: channelID,
                        messageID: event.d.id,
                        reaction: '👍'
                    });

                    // Set CurrentPlayer to next player
                    var snaking = (currentPlayerIndex + 1) % Object.keys(pickList) ? true : false;
                    if (snaking) {
                        currentPlayerIndex++;
                    } else {
                        currentPlayerIndex--;
                    }

                    // Display updated draft
                    compilePickListDisplay();
                    bot.sendMessage({
                        to: channelID,
                        message: pickListDisplay
                    });
                    
                    // Display updated TeamList
                    teamList.splice(teamList.indexOf(parseInt(args[0])), 1);
                    compileTeamListDisplay();
                    bot.sendMessage({
                        to: channelID,
                        message: teamListDisplay
                    });
                }
                break;
            // Reset
            // Resets game, allows users to play again
            case 'reset':
                pickList = {};
                teamList = [];
                teamListDisplay = '';
                break;
            // Help
            // Displays a list of commands a user can select
            case 'help':
                bot.sendMessage({
                    to: channelID,
                    message: 'Hi! I\'m Fantasy FRC, a bot that can organize drafts with FRC! Here\'s what I can do: \n\n' +
                    '`' + prefix + 'prefix <new_prefix>`\n' + 
                    'Allows users to change the character that calls the bot (default is `!`)\n\n' +
                    '`' + prefix + 'TBATeam <team_number>`\n' +
                    'Allows users to access information about Teams, sourced from The Blue Alliance\n\n' + 
                    '`' + prefix + 'setEvent <event_id>`\n' +
                    'Allows users to set the event, from which teams will be pulled\n' + 
                    '`event_id` must be official FIRST event code (ie, FMA Mt. Olive 2019 = 2019njfla)\n\n' + 
                    '`' + prefix + 'checkTeams`\n' +
                    'Displays the remaining available teams in the draft\n\n' + 
                    '`' + prefix + 'setPlayers @user#9999 @user#9999...`\n' +
                    'Allows users to set the players for the draft\n' + 
                    'Requires @user for each player separated by spaces (ie, !setPlayers @Qwerty253#9647 @testUser#9999)\n\n' + 
                    '`' + prefix + 'showDraft`\n' +
                    'Displays the players and their choices in the draft\n\n' + 
                    '`' + prefix + 'checkCurrentPlayer`\n' +
                    'Displays the players whose turn it is\n\n' + 
                    '`' + prefix + 'pick <team_number>`\n' +
                    'Allows users to select a team for their draft alliance\n\n' + 
                    '`' + prefix + 'reset`\n' +
                    'Resets the draft. This is irreversible, so think wisely!\n\n'
                });
                break;
            // Test
            // Prints 'It works' in the console
            case 'test':
                console.log('It works!')
                break;
        }
    }
});

// Functions

// Randomize order of elements in an array
var shuffle = function (array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    
    while (0 !== currentIndex) {
  
      // Pick a remaining element
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
}

// Create teamListDisplay (String) from teamList (array)
var compileTeamListDisplay = function () {
    teamListDisplay = '';
    for (i = 0; i < teamList.length; i++) {
        teamListDisplay += teamList[i] + '\n';
    }
}

// Create pickListDisplay (String) from pickList (JSON)
var compilePickListDisplay = function () {
    var pickListPlayers = Object.keys(pickList);
    var pickListTeams = Object.values(pickList);
    var pickListDisplayArr = [];
    pickListDisplayArr[0] = ['Player', '1st Pick', '2nd Pick', '3rd Pick'];
    for (i = 0; i < pickListPlayers.length; i++) {
        pickListDisplayArr[i + 1] = [pickListPlayers[i], pickListTeams[i][0], pickListTeams[i][1], pickListTeams[i][2]];
    }

    pickListDisplay = createTable(pickListDisplayArr);
}

// Create a pretty table (string) with Discord formatting
var createTable = function (arr) {
    var table = '';
    var colArr = [];
    var fancyBorder = '';
    var regBorder = '';

    for (i = 0; i < arr.length; i++) {
        colArr[i] = arr[i][0].length + 2;
    }

    fancyBorder = '++';
    fancyBorder += '='.repeat(Math.max(...colArr));
    fancyBorder += '+==========+==========+==========++';

    regBorder = fancyBorder.replace(/=/g, '-');

    table += '```'; // Discord monospace
    table += fancyBorder + '\n';

    table += '|| Player ' + ' '.repeat(Math.max(...colArr) - 8) + '| 1st Pick | 2nd Pick | 3rd Pick ||' + '\n'; 
    table += fancyBorder + '\n';

    for (i = 1; i < arr.length; i++) {
        table += '|| ' + arr[i][0] + ' '.repeat(Math.max(...colArr) - arr[i][0].length - 1) +
                 '|   ' + arr[i][1] + ' '.repeat(7 - arr[i][1].length) + 
                 '|   ' + arr[i][2] + ' '.repeat(7 - arr[i][2].length) + 
                 '|   ' + arr[i][3] + ' '.repeat(7 - arr[i][3].length) + '||';
        
        table += '\n';
        table += i !== arr.length - 1 ? regBorder : fancyBorder;
        table += '\n';
    }

    table += '```'; // Discord monospace
    return table;
}
