var express = require('express');
const { off } = require('process');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

const port = process.env.PORT || 8080;

var lobbyUsers = {};
var users = {};
let openGames = {};
let activeGames = {};
var gameNum = 0;

app.use(express.static('build'));  // Serve the React build folder

io.on('connection', function (socket) {
    console.log('new connection ' + socket.id);

    socket.on('login', function (username) {
        while (users[username]){
            username = username + Math.floor(Math.random() * 10).toString();
        }
        console.log(username)
        
        users[username] = { userId: socket, games: [] };
        
        socket.username = username;

        socket.emit('update', {
            users: Object.keys(lobbyUsers),
            games: openGames
        });

        lobbyUsers[username] = socket;
    });

    socket.on('newgame', function (settings) {
        console.log(socket.username + ' Made a game');
        gameNum += 1;
        
        var game = {
            id: gameNum,
            settings: settings,
            users: [socket.username, ''],
        };

        users[socket.username].games.push(game.id);
        socket.gameId = game.id;
        openGames[game.id] = game;

        // Update all other users
        Object.keys(lobbyUsers).forEach((username) => {
            lobbyUsers[username].emit('update', {
                users: Object.keys(lobbyUsers),
                games: openGames
            });
        });
    });

    socket.on('join', function (gameId) {
        console.log('opponent joined: ' + gameId);

        socket.gameId = gameId;

        openGames[gameId]

        activeGames[gameId] =  openGames[gameId];
        var game = activeGames[gameId];
        game.users[1] = socket.username;
        
        var playerToMove=Number(game.settings.color==="Black");
        if(game.settings.color==="Random"){
            playerToMove = Number(Math.floor(Math.random() * 2) === 0)}
        
        var realGame={
            boardSize: game.settings.boardSize,
            mpSettings: {
                users:game.users,
                startPlayer:playerToMove
            }
        }

        // Update the matched players
        lobbyUsers[game.users[0]].emit('matched', realGame);
        lobbyUsers[game.users[1]].emit('matched', realGame);

        // Update all information
        //TODO: I should also erase all open games from both users
        users[socket.username].games.push(game.id);
        delete lobbyUsers[game.users[0]];
        delete lobbyUsers[game.users[1]];
        delete openGames[game.id];
        activeGames[game.id] = game

        // Update all other users
        Object.keys(lobbyUsers).forEach((username) => {
            if (username !== game.users[0] && username !== game.users[1]) {
                lobbyUsers[username].emit('update', {
                    users: Object.keys(lobbyUsers),
                    games: openGames
                });
            }
        });
    });

    socket.on('move', function (msg) {
        console.log('move: ' + msg);
        users[socket.username].games.forEach((gameId) => {
            const game = activeGames[gameId];
            const opponentUsername = game.users[0] === socket.username ? game.users[1] : game.users[0];
            users[opponentUsername].userId.emit('move', msg);
        });
    });
    
});

app.get('*', (req, res) => {
    res.sendFile(__dirname + '\\build\\index.html');  // Serve the index.html from React build folder
});

http.listen(port, function () {
    console.log('listening on *:' + port)
});
