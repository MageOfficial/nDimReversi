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

function MultiDimensionalBoard({ game, dimCoords }) {
  const handleCellClick = (updatedCoords) => {
    game.makeMove(updatedCoords);
  };

  const renderBoard = (currentDimCoords, depth = 0) => {
    const undefinedIndices = currentDimCoords
      .map((item, index) => (item === undefined ? index : null))
      .filter((index) => index !== null);

    if (undefinedIndices.length === 2) {
      const [rowDim, colDim] = undefinedIndices;

      return (
        <Container fluid>
          {Array.from({ length: game.size }).map((_, rowIndex) => (
            <Row
              key={rowIndex}
              className="justify-content-center"
              style={{
                display: "flex"
              }}
            >
              {Array.from({ length: game.size }).map((_, colIndex) => {
                const updatedCoords = [...currentDimCoords];
                updatedCoords[rowDim] = rowIndex;
                updatedCoords[colDim] = colIndex;

                const cellValue = game.get(updatedCoords);

                return (
                  <Col
                    key={colIndex}
                    xs={2} // Control the width of the column
                    className="border p-1"
                    style={{
                      maxWidth: "50px", // Adjust the size of the cell
                      aspectRatio: "1", // Keep the cells square
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "grey",
                    }}
                    onClick={() => handleCellClick(updatedCoords)}
                  >
                    {cellValue !== 2 && (
                      <div
                        style={{
                          width: cellValue === -1 ? "30%" : "90%",
                          height: cellValue === -1 ? "30%" : "90%",
                          backgroundColor:
                            cellValue === 1 ? "white" : cellValue === 0 ? "black" : "#404040",
                          borderRadius: "50%",
                        }}
                      ></div>
                    )}
                  </Col>
                );
              })}
            </Row>
          ))}
        </Container>
      );
    }

    const nextUndefinedDim = undefinedIndices[0];
    const isRowLayout = depth % 2 === 0;

    return (
      <Container fluid>
        <Row
          className={isRowLayout ? "flex-row" : "flex-column"}
          style={{
            gap: "10px", // Equal spacing between rows and columns
            width: "100%", // Ensure full width
          }}
        >
          {Array.from({ length: game.size }).map((_, index) => {
            const updatedCoords = [...currentDimCoords];
            updatedCoords[nextUndefinedDim] = index;

            return (
              <Col
                key={index}
                style={{
                  gap:"10px",
                  padding: "5px",
                  flex: 1, // Allow flexible resizing
                }}
              >
                {renderBoard(updatedCoords, depth + 1)}
              </Col>
            );
          })}
        </Row>
      </Container>
    );
  };

  return renderBoard(dimCoords);
}


function LocalPage() {
  const location = useLocation();
  const { localBoardSize } = location.state || { localBoardSize: { dims: 2, size: 4 } };
  
  // Initialize the game
  const game = new Game(localBoardSize.dims, localBoardSize.size);

  // List of numbers to be displayed (limited by `localBoardSize.dims`)
  const numbers = Array.from({ length: localBoardSize.dims }, (_, index) => index + 1);
  const [activeInputs, setActiveInputs] = useState(
    Array(localBoardSize.dims).fill(undefined)
  );
  
  // Handle number click to toggle between showing and removing the input
  const handleNumberClick = (num) => {
    setActiveInputs((prevInputs) => {
      // Create a new copy of the array
      const newInputs = [...prevInputs];
      // Toggle input field for the clicked number
      newInputs[num] = newInputs[num] === undefined ? '' : undefined;
      return newInputs;
    });
  };
  
  // Handle input change (only accept positive integers between 1 and localBoardSize.size)
  const handleInputChange = (num, value) => {
    // Ensure the value is a positive integer and within the allowed range
    const positiveInteger = parseInt(value, 10);
    if (positiveInteger >= 0 && positiveInteger < localBoardSize.size) {
      setActiveInputs((prevInputs) => {
        const newInputs = [...prevInputs];
        newInputs[num] = positiveInteger; // Update the specific input value
        return newInputs;
      });
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
              onClick={() => handleNumberClick(num-1)}
              style={{
                backgroundColor: activeInputs[num-1] ?  '#C0C0C0' : 'gray',
                color: 'white',
                marginRight: '10px',
                width: '50px', // Fixed width for button
              }}
            >
              {num}
            </Button>
            
            {/* If the number is clicked, show an input box next to it */}
            {activeInputs[num-1] !== undefined && (
              <Form.Control
                type="number"
                value={activeInputs[num-1]}
                onChange={(e) => handleInputChange(num-1, e.target.value)}
                placeholder="Distance"
                min="0"
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
          <MultiDimensionalBoard game={game} dimCoords={activeInputs} />
        </header>
      </div>
    </div>
  );
}

export default App;
