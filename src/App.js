import React, { useEffect, useState, useRef, useMemo } from "react";
import "./App.css";
import { Button, Form, Container, Row, Col, ButtonGroup } from "react-bootstrap";
import { BrowserRouter as Router, Route, Routes, Link, useNavigate, useLocation} from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import "bootstrap/dist/css/bootstrap.css";
import Game from './gameLogic.js';
import socket from "./socket";

function App() {
  const [modalContent, setModalContent] = useState(null);
  const [settings, setSettings] = useState({
    boardSize: { dims: 2, size: 4 },
    aiDepth: 3,
    color: "Black",
  });

  const handleButtonClick = (option) => {
    setModalContent(option);
  };

  const closeModal = () => {
    setModalContent(null);
  };

  const updateSetting = (key, value) => {
    setSettings((prevSettings) => {
      if (key === "boardSize") {
        return {
          ...prevSettings,
          boardSize: {
            ...prevSettings.boardSize,
            ...value,
          },
        };
      } else {
        return {
          ...prevSettings,
          [key]: typeof value === "function" ? value(prevSettings[key]) : value,
        };
      }
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
              settings={settings}
              updateSetting={updateSetting}
            />
          }
        />
        <Route path="/local" element={<GamePage />} />
        <Route path="/online" element={<OnlinePage />} />
        <Route path="/online/game" element={<GamePage />} />
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
      navigate("/local", { state: { boardSize: settings.boardSize } });
    } else if (modalContent === "AI") {
      var newColor=settings.color;
      if(settings.color === "Random"){ 
        newColor=Math.random() > 0.5 ? 0 : 1
      }
      else{
        newColor=Number(settings.color!=="Black")
      }
      navigate("/ai", {
        state: {
          boardSize: settings.boardSize,
          aiSettings: {depth: settings.aiDepth, player: newColor}
        }
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
                        updateSetting("boardSize", {
                          dims: Math.max(0, settings.boardSize.dims - 1),
                        })
                      }
                    >
                      -
                    </Button>
                    <Form.Control
                      type="number"
                      value={settings.boardSize.dims}
                      readOnly
                      className="mx-2"
                    />
                    <Button
                      variant="secondary"
                      onClick={() =>
                        updateSetting("boardSize", {
                          dims: settings.boardSize.dims + 1,
                        })
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
                        updateSetting("boardSize", {
                          size: Math.max(2, settings.boardSize.size - 2),
                        })
                      }
                    >
                      -
                    </Button>
                    <Form.Control
                      type="number"
                      value={settings.boardSize.size}
                      readOnly
                      className="mx-2"
                    />
                    <Button
                      variant="secondary"
                      onClick={() =>
                        updateSetting("boardSize", {
                          size: settings.boardSize.size + 2,
                        })
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
                      updateSetting("aiDepth", () => Number(e.target.value))
                    }
                  />
                  <div className="text-center">
                    <small>Current Depth: {settings.aiDepth}</small>
                  </div>

                  {/* Color Selection Buttons */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: "10px",
                    }}
                  >
                    <p className="me-3 mb-0">Select Color:</p>
                    <ButtonGroup>
                      {["Black", "Random", "White"].map((color) => (
                        <Button
                          key={color}
                          variant={
                            settings.color === color ? "primary" : "outline-primary"
                          }
                          onClick={() => updateSetting("color", color)}
                        >
                          {color}
                        </Button>
                      ))}
                    </ButtonGroup>
                  </div>
                </>
              )}
            </>
          )}
          {modalContent === "Online" && (
            <Form className="d-flex flex-column align-items-center">
              <Form.Group controlId="stringInput" className="mb-3">
                <Form.Label>Enter Username:</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Bob"
                  className="text-center"
                  value={strInput}
                  onChange={(e) => setStrInput(e.target.value)}
                />
              </Form.Group>
              <Button
                variant="primary"
                type="button"
                onClick={() =>
                  navigate("/online", { state: { username: strInput } })
                }
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
          {(modalContent === "Local" || modalContent === "AI") && (
            <Button variant="primary" onClick={handleCreateClick}>
              Create
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
}

function MultiDimensionalBoard({ game, is2P, dimCoords, onCellClick, player}) {

  var moveAble=!is2P||game.player===player

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

                if(
                  cellValue===2 //Check if square is empty
                  &&(moveAble) //Check to see if it is the current players turn or if there is no turns
                  &&game.getMoves(updatedCoords, game.player)) //Check to see if its possible to move to this square
                  cellValue=-1

                return (
                  //Individual cell
                  <Col
                    key={colIndex}
                    xs={2} // Control the width of the column
                    className="border p-1"
                    style={{
                      maxWidth: "50px",
                      aspectRatio: "1", 
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "grey",
                    }}
                    onClick={() => {if(moveAble) onCellClick(updatedCoords)}}
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

  const {
    boardSize = defaultBoardSize,
    aiSettings,
    mpSettings,
    username,
  } = location.state || {};

  const isAI = aiSettings !== undefined;
  const isMP = mpSettings !== undefined;
  const is2P = isAI || isMP;

  const player = isAI ? aiSettings.player : isMP ? (Number(mpSettings.users[mpSettings.startPlayer]!==username)) : undefined;

  // Initialize the game
  const gameRef = useRef(new Game(boardSize.dims, boardSize.size));

  const [turn, setTurn] = useState(false); 

  const handleTurnChange = () => {
    setTurn((prevTurn) => !prevTurn);
  }

  const handleCellClick = (coords) => {
    var success=gameRef.current.makeMove(coords);
    if(success){
      if(isMP){
        socket.emit("move", coords)
      }
      handleTurnChange();
    }
  };

  useEffect(() => {
    if (isMP) {
      const handleMove = (msg) => {
        if (msg === "pass") {
          gameRef.current.pass();
        } else {
          gameRef.current.makeMove(msg);
        }
        handleTurnChange();
      };

      socket.on("move", handleMove);

      // Cleanup listener on component unmount
      return () => {
        socket.off("move", handleMove);
      };
    }
  }, []); // Run once when the component mounts


  // List of numbers to be displayed up to boardSize.dims
  const numbers = Array.from({ length: boardSize.dims }, (_, index) => index + 1);
  const [activeInputs, setActiveInputs] = useState(
    Array(boardSize.dims).fill(undefined)
  );
  
  const handleNumberClick = (num) => {
      setActiveInputs((prevInputs) => {
        const newInputs = [...prevInputs];
        if(newInputs[num] === undefined && activeInputs.reduce((acc, cur) => acc + (cur === undefined), 0) > 2){
          newInputs[num] = 0;
        }
        else{
          newInputs[num] = undefined;
        }
        return newInputs;
      });
  };
  
  // Handle input change
  const handleInputChange = (num, value) => {
    // Value is a positive integer from 0 to size
    const positiveInteger = parseInt(value, 10);
    if (positiveInteger >= 0 && positiveInteger < boardSize.size) {
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
                max={boardSize.size}
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
          <p>Dimensions: {boardSize.dims} & Size: {boardSize.size}</p>
          
          {/* Display Current Turn */}
          <div
            style={{
              marginBottom: "20px", // Add some spacing
              display: "flex",
              justifyContent: "center", // Center the circle
              alignItems: "center", // Align the circle vertically
            }}
          >
            {/* Current Turn Circle */}
            <div
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                backgroundColor: turn ? "white" : "black", // Change the color based on the current player's turn
                display: "flex",
                justifyContent: "center", // Center the text inside the circle
                alignItems: "center", // Center the text vertically
                color: turn ? "black" : "white", // Set text color to contrast the circle color
                fontWeight: "bold", // Optional: to make the text stand out
                fontSize: "18px", // Optional: adjust the font size
              }}
            >
              Turn
            </div>

            {/* Pass Button */}
            <Button 
              onClick={() => {
                if(!is2P||gameRef.current.player===player){
                  gameRef.current.pass()
                  handleTurnChange();
                  if(isMP){
                    socket.emit("move", "pass")
                  }
                }
              }}
              style={{
                marginLeft: "20px",
                backgroundColor: "#202020",
                fontSize: "16px",
              }}
            >
              Pass
            </Button>
          </div>

          {/* Render the Board */}
          <MultiDimensionalBoard
            game={gameRef.current}
            is2P={is2P}
            dimCoords={activeInputs}
            onCellClick={handleCellClick}
            player={player}
          />
        </header>
      </div>
    </div>
  );
}

function OnlinePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState(location.state?.username || "Guest");

  const [showModal, setShowModal] = useState(false);
  const [settings, setSettings] = useState({
    boardSize: { dims: 2, size: 4 },
    color: "Random",
  });

  const [gamesList, setGamesList] = useState({});

  useEffect(() => {
    socket.emit("login", username);
  }, []);

  useEffect(() => {  
    const handleUpdate = (msg) => {
      if (msg.username !== username) setUsername(msg.username);
      setGamesList(msg.games);
    };
  
    const handleMatched = (msg) => {
      navigate('/online/game', {
        state: {
          boardSize: msg.boardSize,
          mpSettings: msg.mpSettings,
          username: username,
        },
      });
    };
  
    socket.on("update", handleUpdate);
    socket.on("matched", handleMatched);
  
    return () => {
      socket.off("update", handleUpdate);
      socket.off("matched", handleMatched);
    };
  }, [username, navigate]);

  const updateSetting = (key, updater) => {
    setSettings((prev) => ({
      ...prev,
      boardSize: {
        ...prev.boardSize,
        [key]: updater(prev.boardSize[key]),
      },
    }));
  };

  const handleColorChange = (color) => {
    setSettings((prev) => ({ ...prev, color }));
  };

  const handleCreateClick = () => {
    socket.emit("newgame", settings);
    setShowModal(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <div
          className="d-flex flex-column align-items-center justify-content-start"
          style={{ height: "100vh", padding: "1rem", width: '90%' }} 
        >
          <h1 className="mb-4">Online</h1>
          <Button
            variant="primary"
            size="lg"
            onClick={() => setShowModal(true)}
            style={{
              fontSize: "16px",
              padding: "10px 20px",
            }}
          >
            Create Room
          </Button>
          {/* Games List */}
          <div className="mt-4 w-100">
            <h3>Available Games</h3>
            <ul className="list-group">
              {/* Column headers */}
              <li className="list-group-item d-flex justify-content-between align-items-center font-weight-bold">
                <div className="col-2">Player</div>
                <div className="col-2">Dimensions</div>
                <div className="col-2">Size</div>
                <div className="col-2">Color</div>
                <div className="col-1"></div>
              </li>

              {Object.keys(gamesList).length > 0 ? (
                Object.entries(gamesList).map(([gameId, game]) => (
                  <li
                    key={gameId}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div className="col-2">{game.users[0]}</div>
                    <div className="col-2">{game.settings.boardSize.dims}</div>
                    <div className="col-2">{game.settings.boardSize.size}</div>
                    <div className="col-2">{game.settings.color}</div>
                    <div className="col-1">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => socket.emit("join", gameId)}
                      >
                        Join
                      </Button>
                    </div>
                  </li>
                ))
              ) : (
                <li className="list-group-item">No games available</li>
              )}
            </ul>
          </div>

          {/* Modal for Create Room */}
          <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Create Room</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Set up your game dimensions, size, and color:</p>

              {/* Dimensions and Size */}
              <div className="d-flex justify-content-between mb-3">
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
                      value={settings.boardSize.dims}
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
                      value={settings.boardSize.size}
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

              {/* Color Selection */}
              <div>
                <label>Select Color</label>
                <ButtonGroup className="d-flex">
                  {["Black", "Random", "White"].map((color) => (
                    <Button
                      key={color}
                      variant={settings.color === color ? "primary" : "outline-primary"}
                      onClick={() => handleColorChange(color)}
                    >
                      {color}
                    </Button>
                  ))}
                </ButtonGroup>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
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

