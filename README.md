# Fantasy FRC

Fantasy FRC is a Discord Bot created to run drafts 
for teams competing at FIRST Robotics Competition 
(FRC) Events. Players take turns selecting teams to 
build fantasy alliances, earning points based on the 
performance of each of the teams at the selected 
event. Data on teams attending events as well as 
team status is sourced from The Blue Alliance (TBA).

## Gameplay

### Drafting

1. Choose an event. This can be any FRC Event from 
around the world. Using the `setEvent` command will 
populate teams attending the chosen event into the 
available teams roster.

2. Set your players. Using the `setPlayers` command 
followed by tagging users from the server (including 
yourself if you want!) will populate these players 
into the draft based on their Discord nicknames in 
the server that the bot is running.

3. Run the `showDraft` command to display the 
randomly generated pick order of the players. This 
command will be run automatically after every pick 
to show an updated draft, but can also be run any 
time during the draft.

4. The first player in the draft can select a team 
by using the `pick` command. It will then be the 
next player's turn until the 1st round is over. The 
pick order is serpentine, meaning that the 1st round 
runs from Player 1 to Player X, the second round 
runs from Player X to Player 1, and the third round 
runs from Player 1 to Player X (where X is the total 
number of players participating in the draft).

5. At any point during the draft, use the 
`showDraft`, `checkTeams`, or `showCurrentPlayer` 
for clarification.

6. When the draft is over, or needs to be restarted, 
use the `reset` command. Be careful, as this is 
irreversible.

### Scoring

Functionality yet to be implemented

## Commands

`!prefix <new_prefix>`

Allows users to change the character that calls the bot (default is !)

`!TBATeam <team_number>`

Allows users to access information about Teams, sourced from The Blue Alliance

`!setEvent <event_id>`

Allows users to set the event, from which teams will be pulled
event_id must be official FIRST event code (ie, FMA Mt. Olive 2019 = 2019njfla)

`!checkTeams`

Displays the remaining available teams in the draft

`!setPlayers @user#9999 @user#9999...`

Allows users to set the players for the draft
Requires @user for each player separated by spaces (ie, !setPlayers @Qwerty253#9647 @testUser#9999)

`!showDraft`

Displays the players and their choices in the draft

`!checkCurrentPlayer`

Displays the players whose turn it is

`!pick <team_number>`

Allows users to select a team for their draft alliance

`!reset`

Resets the draft. This is irreversible, so think wisely!

