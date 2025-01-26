# n-Dimensional Reversi
## About the Game

Reversi is a game where two players attempt to end with the highest number of pieces of their color. A piece is placed so that it forms a line with another friendly piece and all enemy pieces in between are flipped.\
This project extends this to any amount of dimensions (Though practically it is harder to go larger than 8). Boards are shown in 2D slices and you can limit what slices you see at once.

This code is hosted at this [website](https://ndimreversi.onrender.com/)

### Local

Local play versus yourself or against someone using the same page.

### Online

Online play that allows you to host a room versus an online opponent

### AI(Not Yet Workingp)

WIP: Will allow you to play against an AI

## About the Code

The project uses Node.js, React.js, and Bootstrap. A server creates a socket.io connection between players to allow for online play.

## Available Scripts

In the project directory, you can run:

### `npm start`

To run the app in the development mode without any online features
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.

### 'npm run server'

Run's server.js to host the server
