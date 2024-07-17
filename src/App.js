import React, { useState, useRef, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

const ChessGame = () => {
  const [game, setGame] = useState(new Chess());
  const [moveFrom, setMoveFrom] = useState('');
  const [rightClickedSquares, setRightClickedSquares] = useState({});
  const [moveSquares, setMoveSquares] = useState({});
  const [optionSquares, setOptionSquares] = useState({});
  const [boardWidth, setBoardWidth] = useState(480);
  const chessboardRef = useRef(null);

  useEffect(() => {
    function handleResize() {
      if (chessboardRef.current) {
        const height = window.innerHeight;
        const width = window.innerWidth;
        const size = Math.min(width - 40, height - 200, 480);
        setBoardWidth(size);
      }
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function getMoveOptions(square) {
    const moves = game.moves({
      square,
      verbose: true
    });
    if (moves.length === 0) {
      return false;
    }

    const newSquares = {};
    moves.map((move) => {
      newSquares[move.to] = {
        background:
          game.get(move.to) &&
          game.get(move.to).color !== game.get(square).color
            ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
            : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%'
      };
      return move;
    });
    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)'
    };
    setOptionSquares(newSquares);
    return true;
  }

  function onSquareClick(square) {
    setRightClickedSquares({});

    if (moveFrom === square) {
      setMoveFrom('');
      setOptionSquares({});
      return;
    }

    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      if (moveFrom) {
        setMoveFrom('');
        setOptionSquares({});
      }
      
      const hasMoveOptions = getMoveOptions(square);
      if (hasMoveOptions) setMoveFrom(square);
      return;
    }

    if (moveFrom) {
      const gameCopy = new Chess(game.fen());
      try {
        const move = gameCopy.move({
          from: moveFrom,
          to: square,
          promotion: 'q'
        });
        if (move) {
          setGame(gameCopy);
          setMoveFrom('');
          setOptionSquares({});
        }
      } catch (error) {
        setMoveFrom('');
        setOptionSquares({});
      }
    }
  }

  function onSquareRightClick(square) {
    const colour = 'rgba(0, 0, 255, 0.4)';
    setRightClickedSquares({
      ...rightClickedSquares,
      [square]:
        rightClickedSquares[square] &&
        rightClickedSquares[square].backgroundColor === colour
          ? undefined
          : { backgroundColor: colour }
    });
  }

  function restartGame() {
    setGame(new Chess());
    setMoveFrom('');
    setRightClickedSquares({});
    setMoveSquares({});
    setOptionSquares({});
  }

  return (
    <div className="chess-game">
      <h1>Chess Game</h1>
      <div ref={chessboardRef}>
        <Chessboard
          id="BasicBoard"
          animationDuration={200}
          arePiecesDraggable={false}
          position={game.fen()}
          onSquareClick={onSquareClick}
          onSquareRightClick={onSquareRightClick}
          customBoardStyle={{
            borderRadius: '4px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
          }}
          customSquareStyles={{
            ...moveSquares,
            ...optionSquares,
            ...rightClickedSquares
          }}
          boardWidth={boardWidth}
        />
      </div>
      <div className="game-info">
        <p>
          Game status: {game.isCheckmate() ? 'Checkmate!' : game.isDraw() ? 'Draw' : 'Ongoing'}
        </p>
        <p>
          Turn: {game.turn() === 'w' ? 'White' : 'Black'}
        </p>
      </div>
      {game.isCheckmate() && (
        <div className="checkmate-screen">
          <div className="checkmate-modal">
            <h2>Checkmate!</h2>
            <p>{game.turn() === 'w' ? 'Black' : 'White'} wins!</p>
            <button onClick={restartGame}>Play Again</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChessGame;