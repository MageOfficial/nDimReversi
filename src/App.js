import React, { useEffect, useState } from "react";
import "./App.css";
import { Button, Form, Container, Row, Col, ListGroup } from "react-bootstrap";
import { BrowserRouter as Router, Route, Routes, Link, useNavigate, useLocation } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import "bootstrap/dist/css/bootstrap.css";
import Game from './gameLogic.js';

function App() {
  const [modalContent, setModalContent] = useState(null); 
  const [settings, setSettings] = useState({
    localBoardSize: { dims: 2, size: 4 },
    aiDepth: 3,
    playAsBlack: true,
  });

  const handleButtonClick = (option) => {
    setModalContent(option);
  };

  const closeModal = () => {
    setModalContent(null);
  };

  const updateSetting = (key, value) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [key]: typeof value === "function" ? value(prevSettings[key]) : value,
    }));
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
              settings={settings}
              updateSetting={updateSetting}
            />
          }
        />
        <Route path="/local" element={<GamePage />} />
        <Route path="/online" element={<OnlinePage />} />
        <Route path="/ai" element={<GamePage />} />
      </Routes>
    </Router>
  );
}

function MainPage({
  handleButtonClick,
  modalContent,
  closeModal,
  settings,
  updateSetting,
}) {

  const [strInput, setStrInput] = useState("");
  const navigate = useNavigate();

  const handleCreateClick = () => {
    if (modalContent === "Local") {
      navigate("/local", { state: { localBoardSize: settings.localBoardSize } });
    } else if (modalContent === "AI") {
      navigate("/ai", {
        state: {
          localBoardSize: settings.localBoardSize,
          aiDepth: settings.aiDepth,
          playAsBlack: settings.playAsBlack,
        },
      });
    }
    closeModal();
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
          {(modalContent === "Local" || modalContent === "AI") && (
            <>
              <p>Input Board Dimensions and Size:</p>
              <div className="d-flex justify-content-between">
                <div>
                  <label>Dimensions</label>
                  <div className="d-flex">
                    <Button
                      variant="secondary"
                      onClick={() =>
                        updateSetting("localBoardSize", (prev) => ({
                          ...prev,
                          dims: Math.max(0, prev.dims - 1),
                        }))
                      }
                    >
                      -
                    </Button>
                    <Form.Control
                      type="number"
                      value={settings.localBoardSize.dims}
                      readOnly
                      className="mx-2"
                    />
                    <Button
                      variant="secondary"
                      onClick={() =>
                        updateSetting("localBoardSize", (prev) => ({
                          ...prev,
                          dims: prev.dims + 1,
                        }))
                      }
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
                      onClick={() =>
                        updateSetting("localBoardSize", (prev) => ({
                          ...prev,
                          size: Math.max(2, prev.size - 2),
                        }))
                      }
                    >
                      -
                    </Button>
                    <Form.Control
                      type="number"
                      value={settings.localBoardSize.size}
                      readOnly
                      className="mx-2"
                    />
                    <Button
                      variant="secondary"
                      onClick={() =>
                        updateSetting("localBoardSize", (prev) => ({
                          ...prev,
                          size: prev.size + 2,
                        }))
                      }
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
              {modalContent === "AI" && (
                <>
                  <p className="mt-3">Select AI Depth:</p>
                  <Form.Range
                    min={1}
                    max={5}
                    step={1}
                    value={settings.aiDepth}
                    onChange={(e) =>
                      updateSetting("aiDepth", Number(e.target.value))
                    }
                  />
                  <div className="text-center">
                    <small>Current Depth: {settings.aiDepth}</small>
                  </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: "10px"
                      }}
                    >
                      <Form.Check
                        type="checkbox"
                        id="playAsBlackCheckbox"
                        label="Play as Black"
                        className="custom-checkbox"
                        checked={settings.playAsBlack}
                        onChange={(e) => updateSetting("playAsBlack", e.target.checked)}
                      />
                    </div>
                </>
              )}
            </>
          )}
            {modalContent == "Online" && (
              <Form className="d-flex flex-column align-items-center">
                {/* String Input Field */}
                <Form.Group controlId="stringInput" className="mb-3">
                  <Form.Label>Enter Username:</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Bob"
                    className="text-center"
                    value={strInput} // Bind input value to state
                    onChange={(e) => setStrInput(e.target.value)} // Update state on change
                  />
                </Form.Group>

                {/* Submit Button */}
                <Button
                  variant="primary"
                  type="button"
                  onClick={() => navigate("/online", { state: { name: strInput } })} // Pass strInput as state
                >
                  Enter
                </Button>
              </Form>
            )}
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
  const [_, rerender] = useState(false);

  const handleCellClick = (updatedCoords) => {
    game.makeMove(updatedCoords);
    rerender(prev => !prev);
  };

  const renderBoard = (currentDimCoords, depth = 0) => {
    const undefinedIndices = currentDimCoords
      .map((item, index) => (item === undefined ? index : null))
      .filter((index) => index !== null);

    if (undefinedIndices.length === 2) {
      const [rowDim, colDim] = undefinedIndices;

      return (
        <Container
          fluid
          style={{
            padding: 0
          }}
        >
          {Array.from({ length: game.size }).map((_, rowIndex) => (
            <Row
              key={rowIndex}
              className="justify-content-center"
              style={{
                display: "flex",
              }}
            >
              {Array.from({ length: game.size }).map((_, colIndex) => {
                const updatedCoords = [...currentDimCoords];
                updatedCoords[rowDim] = rowIndex;
                updatedCoords[colDim] = colIndex;

                var cellValue = game.get(updatedCoords);

                if(cellValue===2&&game.getMoves(updatedCoords, game.player))
                  cellValue=-1

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

    if(isRowLayout){
      return (
        <Container
          fluid
          style={{
            padding: 0
          }}
        >
          <Row>
            {Array.from({ length: game.size }).map((_, index) => {
              const updatedCoords = [...currentDimCoords];
              updatedCoords[nextUndefinedDim] = index;

              return (
                <Col
                  key={index}
                  style={{
                    padding: "2px"
                  }}
                >
                  {renderBoard(updatedCoords, depth + 1)}
                </Col>
              );
            })}
          </Row>
        </Container>
      );
    }
    else{
      return (
        <Container
          fluid
          style={{
            padding: 0
          }}
        >
          <Col
            className={"column justify-content-center align-items-center"}
            style={{
              width: "100%"
            }}
          >
            {Array.from({ length: game.size }).map((_, index) => {
              const updatedCoords = [...currentDimCoords];
              updatedCoords[nextUndefinedDim] = index;

              return (
                <Col
                  key={index}
                  style={{
                    padding: "4px"
                  }}
                >
                  {renderBoard(updatedCoords, depth + 1)}
                </Col>
              );
            })}
          </Col>
        </Container>
      );
    }
  };
  
  return renderBoard(dimCoords);
}

function GamePage() {
  const location = useLocation();
  const defaultBoardSize = { dims: 2, size: 4 };

  const { localBoardSize = defaultBoardSize, localAIDepth, username } = location.state || {};
  const isAIGame = localAIDepth !== undefined;
  const isMultiplayer = username !== undefined;
  
  // Initialize the game
  const game = new Game(localBoardSize.dims, localBoardSize.size);

  // List of numbers to be displayed up to localBoardSize.dims
  const numbers = Array.from({ length: localBoardSize.dims }, (_, index) => index + 1);
  const [activeInputs, setActiveInputs] = useState(
    Array(localBoardSize.dims).fill(undefined)
  );

  const [player, turnChange] = useState(game.player);  // Use game state
  
  const handleNumberClick = (num) => {
    setActiveInputs((prevInputs) => {
      const newInputs = [...prevInputs];
      // Toggle input field for the clicked number
      newInputs[num] = newInputs[num] === undefined ? '' : undefined;
      return newInputs;
    });
  };
  
  // Handle input change
  const handleInputChange = (num, value) => {
    // Value is a positive integer from 0 to size
    const positiveInteger = parseInt(value, 10);
    if (positiveInteger >= 0 && positiveInteger < localBoardSize.size) {
      setActiveInputs((prevInputs) => {
        const newInputs = [...prevInputs];
        newInputs[num] = positiveInteger;
        return newInputs;
      });
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <div
        style={{
          width: '200px',
          padding: '10px',
          border: '1px solid #ccc',
          height: '100vh',
          overflowY: 'auto',
        }}
      >
        <div className="mb-4">
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
                width: '50px'
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

      {/* Main Game Area */}
      <div style={{ flexGrow: 1 }}>
        <header className="App-header">
          <h1>Game</h1>
          <p>Dimensions: {localBoardSize.dims} & Size: {localBoardSize.size}</p>
              {/* Display Current Turn */}
          <div
            style={{
              marginBottom: "20px", // Add some spacing
              display: "flex",
              justifyContent: "center", // Center the circle
              alignItems: "center", // Align the circle vertically
            }}
          >
            <div
              style={
                {
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                backgroundColor: player ? "white" : "black", // Change the color based on the current player's turn
                display: "flex",
                justifyContent: "center", // Center the text inside the circle
                alignItems: "center", // Center the text vertically
                color: player ? "black" : "white", // Set text color to contrast the circle color
                fontWeight: "bold", // Optional: to make the text stand out
                fontSize: "18px", // Optional: adjust the font size
              }}
            >
              Turn
            </div>
          </div>
          <MultiDimensionalBoard game={game} dimCoords={activeInputs} />
        </header>
      </div>
    </div>
  );
}

function OnlinePage() {

  const location = useLocation();
  const username=location.state || {username:"Guest"};

  var socket = io();
  socket.emit('login', username);

  socket.on('login', function (msg) {
    myGames = msg.games;
    updateGamesList();
  });

  socket.on('update', function (msg) {//Updates games whenever one is created
    usersOnline = msg.users;
    //updateUserList();
    myGames = msg.games;
    updateGamesList();
  });

  const [showModal, setShowModal] = useState(false);
  const [settings, setSettings] = useState({
    localBoardSize: { dims: 2, size: 4 },
    playAsBlack: true,
  });

  const handleModalClose = () => setShowModal(false);
  const handleModalShow = () => setShowModal(true);

  const updateSetting = (key, updater) => {
    setSettings((prev) => ({
      ...prev,
      [key]: updater(prev[key]),
    }));
  };

  const navigate = useNavigate();

  const handleCreateClick = () => {
    socket.emit('newlobby', settings);
    //set some content saying waiting for game
    closeModal();
  };

  socket.on('matched', function (msg) {
    //navigate to game-page
    navigate()
  });

  return (
    <div className="App">
      <header className="App-header">
        <div className="d-flex flex-column align-items-center justify-content-start" style={{ height: "100vh", padding: "1rem" }}>
          <h1 className="mb-4">Online</h1>
          <Button variant="primary" size="lg" onClick={handleModalShow}  style={{
            fontSize: "16px",
            padding: "10px 20px",
          }}>
            Create Room
          </Button>

          {/* Modal for Create Room */}
          <Modal show={showModal} onHide={handleModalClose}>
            <Modal.Header closeButton>
              <Modal.Title>Create Room</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Set up your game dimensions and size:</p>
              <div className="d-flex justify-content-between">
                <div>
                  <label>Dimensions</label>
                  <div className="d-flex">
                    <Button
                      variant="secondary"
                      onClick={() =>
                        updateSetting("dims", (prev) => Math.max(1, prev - 1))
                      }
                    >
                      -
                    </Button>
                    <Form.Control
                      type="number"
                      value={settings.dims}
                      readOnly
                      className="mx-2"
                    />
                    <Button
                      variant="secondary"
                      onClick={() =>
                        updateSetting("dims", (prev) => prev + 1)
                      }
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
                      onClick={() =>
                        updateSetting("size", (prev) => Math.max(2, prev - 2))
                      }
                    >
                      -
                    </Button>
                    <Form.Control
                      type="number"
                      value={settings.size}
                      readOnly
                      className="mx-2"
                    />
                    <Button
                      variant="secondary"
                      onClick={() =>
                        updateSetting("size", (prev) => prev + 2)
                      }
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleModalClose}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleCreateClick}>
                Create Room
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </header>
    </div>
  );
}

export default App;
