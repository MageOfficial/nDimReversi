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
        //activeGames[msg.gameId].board = msg.board;
    });

    socket.on('login', function (userId) {
        console.log(userId)
        doLogin(socket, userId);
    });

    function doLogin(socket, userId) {
        socket.userId = userId;

        if (!users[userId]) {
            console.log('creating new user');
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

        //changes active game somehow
        //users[game.users.white].games[game.id] = gameId;
        //users[game.users.white].games[game.id] = game.id;

        console.log('starting game: ' + game.id);
        lobbyUsers[game.users.white].emit('joingame', { game: game, color: 'w'});
        //lobbyUsers[game.users.black].emit('joingame', {game: game, color: 'black'});


        lobbyUsers[game.users.white].broadcast.emit('update', {
            users: Object.keys(lobbyUsers),
            games: Object.keys(activeGames)
        });

        //delete lobbyUsers[game.users.black];   
        console.log(activeGames)
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

        //users[game.users.white].games[game.id] = game.id;
        //users[game.users.black].games[game.id] = game.id;

        /*
        console.log('resuming game: ' + game.id);
        if (lobbyUsers[game.users.white]) {
            lobbyUsers[game.users.white].emit('joingame', {game: game, color: 'white'});
            delete lobbyUsers[game.users.white];
        }
        
        if (lobbyUsers[game.users.black]) {
            lobbyUsers[game.users.black] && 
            lobbyUsers[game.users.black].emit('joingame', {game: game, color: 'black'});
            delete lobbyUsers[game.users.black];  
        }
        */
    });


    socket.on('purchase', function (msg) {
        socket.broadcast.emit('purchase', msg);
    });

    socket.on('sell', function (msg) {
        socket.broadcast.emit('sell', msg);
    });

    socket.on('proposal', function (msg) {
        socket.broadcast.emit('proposal', msg);
    });

    socket.on('accept', function (msg) {
        socket.broadcast.emit('accept', msg);
    });

});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

http.listen(port, function () {
    console.log('listening on *: ' + port)
});