var express = require('express');
var app = express();
app.use(express.static('public'));
var http = require('http').Server(app)
var io = require('socket.io')(http);

const port = process.env.PORT || 8080;

var lobbyUsers = {};
var users = {};
let activeGames = {};
var lobbyNum=0;

io.on('connection', function (socket) {
    console.log('new connection ' + socket);

    socket.on('move', function (msg) {
        socket.broadcast.emit('move', msg);
    });

    socket.on('login', function (userId) {
        console.log(userId)
        doLogin(socket, userId);
    });

    function doLogin(socket, userId) {
        socket.userId = userId;

        if (!users[userId]) {
            users[userId] = { userId: socket.userId, games: activeGames };
        }

        socket.emit('login', {
            users: Object.keys(lobbyUsers),
            games: Object.keys(activeGames)
        });

        lobbyUsers[userId] = socket;

        socket.broadcast.emit('joinlobby', socket.userId);
    }

    socket.on('newlobby', function (clock) {
        console.log(socket.userId + ' Made a lobby');
        lobbyNum+=1;
        socket.broadcast.emit('leavelobby', socket.userId);

        var game = {
            id: lobbyNum,
            board: null,
            users: { white: socket.userId, black: "" },
            timeSettings: clock
        };

        socket.gameId = game.id;
        activeGames[game.id] = game;

        console.log('starting game: ' + game.id);
        lobbyUsers[game.users.white].emit('joingame', { game: game, color: 'w'});

        lobbyUsers[game.users.white].broadcast.emit('update', {
            users: Object.keys(lobbyUsers),
            games: Object.keys(activeGames)
        });
    });

    socket.on('opponentjoin', function (gameId) {
        console.log('opponent joined: ' + gameId);

        socket.gameId = gameId;

        var game = activeGames[gameId];
        
        game.users.black = socket.userId;
        console.log(activeGames)
        lobbyUsers[game.users.black].emit('joingame', { game: game, color: 'b' });
        lobbyUsers[game.users.white].emit('connectionmade', { game: game, color: 'b' });

        delete users[game.users.white].games[game.id]

        lobbyUsers[game.users.black].broadcast.emit('update', {
            users: Object.keys(lobbyUsers),
            games: Object.keys(activeGames)
        });

        delete lobbyUsers[game.users.white];
    });
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

http.listen(port, function () {
    console.log('listening on *: ' + port)
});