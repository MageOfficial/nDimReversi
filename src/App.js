import React, { useState } from "react";
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
function Board({game, dimCoords}) {
  const [board, setBoard] = useState(()=>{
      var newBoard = Array.from({ length: game.size }, () => Array(game.size)) // Initialize n x n board with "false" for unclicked
      for(let i=0; i<game.size; i++){
        for(let j=0; j<game.size; j++){
          newBoard[i][j]=game.get(dimCoords.map(item => {
            if(item===-1) return i
            if(item===-2) return j
            return item
          }))
        }
      }
      return newBoard
    }
  );

  const handleCellClick = (rowIndex, colIndex) => {
    //This line is called once
    var clickSq = dimCoords.map(item => {
      if(item===-1) return rowIndex
      if(item===-2) return colIndex
      return item
    })

    game.makeMove(clickSq)

    setBoard((prevBoard) => {
      const newBoard = prevBoard.map((row, i) =>
        row.map((cell, j) => {
          const coords = dimCoords.map((item) => {
            if (item === -1) return i;
            if (item === -2) return j;
            return item;
          });
          return game.get(coords);
        })
      );
      return newBoard; // Return a new state object
    });
  };

  return (
    <Container className="d-flex flex-column align-items-center">
      {board.map((row, rowIndex) => (
        <Row key={rowIndex} className="justify-content-center" style={{ width: "100%" }}>
          {row.map((value, colIndex) => (
            <Col
              key={colIndex}
              xs={1} // Controls grid size in Bootstrap; can be adjusted for responsiveness
              className="border p-2"
              style={{
                flex: 1, // Allow cells to flex and occupy equal space
                maxWidth: "75px", // Minimum width for each cell
                maxHeight: "75px", // Minimum height for each cell
                aspectRatio: "1", // Keep cells square
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "grey",
              }}
              onClick={() => handleCellClick(rowIndex, colIndex)}
            >
              {value !== 2 && (
                <div
                  style={{
                    width: "90%", // Circle size relative to the cell
                    height: "90%", // Keep circle size proportional
                    backgroundColor: value ? "white" : "black",
                    borderRadius: "50%",
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

  var game = new Game(localBoardSize.dims, localBoardSize.size)

  return (
    <div>
      <div className="position-absolute top-0 start-0 m-3">
        <Link to="/">
          <Button variant="secondary">Home</Button>
        </Link>
      </div>
      <header className="App-header">
        <h1>Game</h1>
        <p>Dimensions: {localBoardSize.dims} & Size: {localBoardSize.size}</p>
        <Board game={game} dimCoords={[-1,-2]} />
      </header>
    </div>
  );
}

export default App;
