import React, { useState } from "react";
import "./App.css";
import { Button, Form } from "react-bootstrap";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Modal from 'react-bootstrap/Modal';
import "bootstrap/dist/css/bootstrap.css";

function App() {
  const [modalContent, setModalContent] = useState(null);
  const [localBoardSize, setLocalBoardSize] = useState({ dims: 4, size: 4 });

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

        <Modal
          show={!!modalContent}
          onHide={closeModal}
        >
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
                        onClick={() => handleBoardChange("size", -1)}
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
                        onClick={() => handleBoardChange("size", 1)}
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
            <Link to="/local">
              <Button variant="primary" onClick={closeModal}>
                Create
              </Button>
            </Link>
          </Modal.Footer>
        </Modal>


        <Routes>
          <Route path="/local" element={<LocalPage />} />
        </Routes>
      </div>
    </Router>
  );
}

function LocalPage() {
  return (
    <div>
      <header className="App-header">
        <Link to="/">
          <Button variant="secondary" className="mb-3">
            Home
          </Button>
        </Link>
        <h1>Local Game Setup</h1>
        {/* Add more content related to the local game setup */}
      </header>
    </div>
  );
}

export default App;
