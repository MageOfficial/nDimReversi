import React, { useState, useEffect } from "react";
import "./App.css";
import { Button, Form, Container, Row, Col } from "react-bootstrap";
import { BrowserRouter as Router, Route, Routes, Link, useNavigate, useLocation } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import "bootstrap/dist/css/bootstrap.css";
import Game from './gameLogic.js';

function App() {
  const [modalContent, setModalContent] = useState(null);
  const [localBoardSize, setLocalBoardSize] = useState({ dims: 2, size: 4 });

  const handleButtonClick = (option) => {
    setModalContent(option);
  };

  const closeModal = () => {
    setModalContent(null);
  };

  const handleBoardChange = (type, change) => {
    setLocalBoardSize((prevState) => {
      let newSize = prevState[type] + change;
      if (type === "dims") {
        newSize = Math.max(0, newSize);
      }
      if (type === "size") {
        newSize = Math.max(2, newSize);
      }
      return { ...prevState, [type]: newSize };
    });
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <MainPage
              handleButtonClick={handleButtonClick}
              modalContent={modalContent}
              closeModal={closeModal}
              localBoardSize={localBoardSize}
              handleBoardChange={handleBoardChange}
            />
          }
        />
        <Route
          path="/local"
          element={<LocalPage />}
        />
      </Routes>
    </Router>
  );
}

function MainPage({
  handleButtonClick,
  modalContent,
  closeModal,
  localBoardSize,
  handleBoardChange,
}) {
  const navigate = useNavigate();

  // Handle "Create" button click and navigate to /local page with localBoardSize
  const handleCreateClick = () => {
    navigate("/local", { state: { localBoardSize } });
    closeModal(); // Close modal after navigating
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="mb-4">n-Dimensional Reversi</h1>
        <Button
          variant="primary"
          size="lg"
          className="mb-3"
          onClick={() => handleButtonClick("Local")}
        >
          Local
        </Button>
        <Button
          variant="success"
          size="lg"
          className="mb-3"
          onClick={() => handleButtonClick("Online")}
        >
          Online
        </Button>
        <Button
          variant="warning"
          size="lg"
          className="mb-3"
          onClick={() => handleButtonClick("AI")}
        >
          AI
        </Button>
      </header>

      <Modal show={!!modalContent} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Options</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalContent === "Local" && (
            <>
              <p>Select board size (dimensions x size):</p>
              <div className="d-flex justify-content-between">
                <div>
                  <label>Dimensions</label>
                  <div className="d-flex">
                    <Button
                      variant="secondary"
                      onClick={() => handleBoardChange("dims", -1)}
                    >
                      -
                    </Button>
                    <Form.Control
                      type="number"
                      value={localBoardSize.dims}
                      readOnly
                      className="mx-2"
                    />
                    <Button
                      variant="secondary"
                      onClick={() => handleBoardChange("dims", 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
                <div>
                  <label>Size</label>
                  <div className="d-flex">
                    <Button
                      variant="secondary"
                      onClick={() => handleBoardChange("size", -2)}
                    >
                      -
                    </Button>
                    <Form.Control
                      type="number"
                      value={localBoardSize.size}
                      readOnly
                      className="mx-2"
                    />
                    <Button
                      variant="secondary"
                      onClick={() => handleBoardChange("size", 2)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
          {modalContent !== "Local" && <p>{modalContent} Mode Selected</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleCreateClick}>
            Create
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

//Should display a 2D slice of the game
//dimCoords are the coordinates of all but two of the dimensions to define a plane
function Board({ game, dimCoords }) {
  const [board, setBoard] = useState([]);

  useEffect(() => {
    // Recompute the board when `dimCoords` or `game` changes
    const newBoard = Array.from({ length: game.size }, () => Array(game.size)); // Initialize n x n board
    for (let i = 0; i < game.size; i++) {
      for (let j = 0; j < game.size; j++) {
        const newCoords = dimCoords.map((item) => {
          if (item === -1) return i;
          if (item === -2) return j;
          return item;
        });

        if (game.getMoves(newCoords, game.player)) {
          newBoard[i][j] = -1;
        } else {
          newBoard[i][j] = game.get(newCoords);
        }
      }
    }
    setBoard(newBoard); // Update the board state
  }, [dimCoords, game]); // Re-run this effect when dimCoords or game changes

  const handleCellClick = (rowIndex, colIndex) => {
    const clickSq = dimCoords.map((item) => {
      if (item === -1) return rowIndex;
      if (item === -2) return colIndex;
      return item;
    });

    game.makeMove(clickSq);

    setBoard((prevBoard) => {
      return prevBoard.map((row, i) =>
        row.map((cell, j) => {
          const coords = dimCoords.map((item) => {
            if (item === -1) return i;
            if (item === -2) return j;
            return item;
          });

          // Recalculate the cell value after the move
          if (game.getMoves(coords, game.player)) {
            return -1;
          }

          return game.get(coords);
        })
      );
    });
  };

  return (
    <Container className="d-flex flex-column align-items-center">
      {board.map((row, rowIndex) => (
        <Row key={rowIndex} className="justify-content-center" style={{ width: '100%' }}>
          {row.map((value, colIndex) => (
            <Col
              key={colIndex}
              xs={1}
              className="border p-2"
              style={{
                flex: 1,
                maxWidth: '75px',
                maxHeight: '75px',
                aspectRatio: '1',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'grey',
              }}
              onClick={() => handleCellClick(rowIndex, colIndex)}
            >
              {value !== 2 && (
                <div
                  style={{
                    width: value === -1 ? '30%' : '90%',
                    height: value === -1 ? '30%' : '90%',
                    backgroundColor: value === 1 ? 'white' : value === 0 ? 'black' : '#404040',
                    borderRadius: '50%',
                  }}
                ></div>
              )}
            </Col>
          ))}
        </Row>
      ))}
    </Container>
  );
}

function LocalPage() {
  const location = useLocation();
  const { localBoardSize } = location.state || { localBoardSize: { dims: 2, size: 4 } };
  
  // Initialize the game
  const game = new Game(localBoardSize.dims, localBoardSize.size);

  // List of numbers to be displayed (limited by `localBoardSize.dims`)
  const numbers = Array.from({ length: localBoardSize.dims }, (_, index) => index + 1);
  const [activeInputs, setActiveInputs] = useState({}); // Keeps track of which numbers have inputs

  // Handle number click to toggle between showing and removing the input
  const handleNumberClick = (num) => {
    setActiveInputs((prevInputs) => {
      // Toggle input field for the clicked number
      const newInputs = { ...prevInputs };
      if (newInputs[num] !== undefined) {
        // If input exists, remove it (set to undefined)
        delete newInputs[num];
      } else {
        // Otherwise, show input field with initial value as an empty string
        newInputs[num] = '';
      }
      return newInputs;
    });
  };

  // Handle input change (only accept positive integers between 1 and localBoardSize.size)
  const handleInputChange = (num, value) => { 
    // Ensure the value is a positive integer and within the allowed range
    const positiveInteger = parseInt(value, 10);
    if (positiveInteger > 0 && positiveInteger <= localBoardSize.size && Number.isInteger(positiveInteger)) {
      setActiveInputs((prevInputs) => ({ ...prevInputs, [num]: positiveInteger }));
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      {/* List of numbers on the left */}
      <div
        style={{
          width: '200px', // Fixed width for the number list box
          padding: '10px',
          border: '1px solid #ccc',
          height: '100vh',
          overflowY: 'auto',
        }}
      >
        <div className="mb-4">
          {/* Link to go back to the Home page */}
          <Link to="/">
            <Button variant="secondary">Home</Button>
          </Link>
        </div>

        <h2>Dimensions</h2>
        {numbers.map((num) => (

          
          <div key={num} className="d-flex align-items-center mb-2">
            <Button
              variant="secondary"
              onClick={() => handleNumberClick(num)}
              style={{
                backgroundColor: activeInputs[num] ?  '#C0C0C0' : 'gray',
                color: 'white',
                marginRight: '10px',
                width: '50px', // Fixed width for button
              }}
            >
              {num}
            </Button>
            
            {/* If the number is clicked, show an input box next to it */}
            {activeInputs[num] !== undefined && (
              <Form.Control
                type="number"
                value={activeInputs[num]}
                onChange={(e) => handleInputChange(num, e.target.value)}
                placeholder="Distance"
                min="1"
                max={localBoardSize.size}
                style={{ width: '100px' }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Main Game Area on the right */}
      <div style={{ flexGrow: 1 }}>
        <header className="App-header">
          <h1>Game</h1>
          <p>Dimensions: {localBoardSize.dims} & Size: {localBoardSize.size}</p>
          <Board game={game} dimCoords={[-1,-2]} />
        </header>
      </div>
    </div>
  );
}
export default App;
