const chessboard = document.getElementById('chessboard');
const turnDisplay = document.getElementById('turn');
const messageDisplay = document.getElementById('message');
const resetBtn = document.getElementById('resetBtn');

let board = [];
let selectedSquare = null;
let currentTurn = 'white';

// Chess piece Unicode characters
const pieces = {
    white: {
        king: '♔',
        queen: '♕',
        rook: '♖',
        bishop: '♗',
        knight: '♘',
        pawn: '♙'
    },
    black: {
        king: '♚',
        queen: '♛',
        rook: '♜',
        bishop: '♝',
        knight: '♞',
        pawn: '♟'
    }
};

// Initialize the chess board
function initializeBoard() {
    board = [
        ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
        ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
        ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
    ];
    
    currentTurn = 'white';
    selectedSquare = null;
    messageDisplay.textContent = '';
    renderBoard();
}

// Render the chessboard
function renderBoard() {
    chessboard.innerHTML = '';
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.classList.add((row + col) % 2 === 0 ? 'white' : 'black');
            square.dataset.row = row;
            square.dataset.col = col;
            square.textContent = board[row][col];
            
            square.addEventListener('click', () => handleSquareClick(row, col));
            chessboard.appendChild(square);
        }
    }
    
    updateTurnDisplay();
}

// Handle square click
function handleSquareClick(row, col) {
    const piece = board[row][col];
    
    if (selectedSquare === null) {
        // Select a piece
        if (piece && isCurrentPlayerPiece(piece)) {
            selectedSquare = { row, col };
            highlightSquare(row, col);
        }
    } else {
        // Move the piece
        if (selectedSquare.row === row && selectedSquare.col === col) {
            // Deselect
            clearHighlights();
            selectedSquare = null;
        } else if (isValidMove(selectedSquare.row, selectedSquare.col, row, col)) {
            // Make the move
            movePiece(selectedSquare.row, selectedSquare.col, row, col);
            clearHighlights();
            selectedSquare = null;
            
            // Check for game end conditions
            if (isKingCaptured()) {
                messageDisplay.textContent = `${currentTurn === 'white' ? 'Black' : 'White'} Wins!`;
                setTimeout(() => {
                    alert(`${currentTurn === 'white' ? 'Black' : 'White'} Wins!`);
                    initializeBoard();
                }, 100);
            } else {
                // Switch turn
                currentTurn = currentTurn === 'white' ? 'black' : 'white';
                renderBoard();
            }
        } else {
            // Invalid move, try selecting a new piece
            clearHighlights();
            selectedSquare = null;
            if (piece && isCurrentPlayerPiece(piece)) {
                selectedSquare = { row, col };
                highlightSquare(row, col);
            }
        }
    }
}

// Check if piece belongs to current player
function isCurrentPlayerPiece(piece) {
    const whitePieces = Object.values(pieces.white);
    const blackPieces = Object.values(pieces.black);
    
    if (currentTurn === 'white') {
        return whitePieces.includes(piece);
    } else {
        return blackPieces.includes(piece);
    }
}

// Basic move validation (simplified)
function isValidMove(fromRow, fromCol, toRow, toCol) {
    const piece = board[fromRow][fromCol];
    const targetPiece = board[toRow][toCol];
    
    // Can't capture own piece
    if (targetPiece && isCurrentPlayerPiece(targetPiece)) {
        return false;
    }
    
    // Basic movement rules (simplified)
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    
    // Pawn movement (simplified - no en passant)
    if (piece === '♙' || piece === '♟') {
        const direction = piece === '♙' ? -1 : 1;
        const startRow = piece === '♙' ? 6 : 1;
        
        // Move forward
        if (fromCol === toCol && !targetPiece) {
            if (toRow === fromRow + direction) return true;
            if (fromRow === startRow && toRow === fromRow + 2 * direction && !board[fromRow + direction][fromCol]) return true;
        }
        // Capture diagonally
        if (Math.abs(toCol - fromCol) === 1 && toRow === fromRow + direction && targetPiece) {
            return true;
        }
        return false;
    }
    
    // Rook movement
    if (piece === '♖' || piece === '♜') {
        if (fromRow === toRow || fromCol === toCol) {
            return isPathClear(fromRow, fromCol, toRow, toCol);
        }
        return false;
    }
    
    // Bishop movement
    if (piece === '♗' || piece === '♝') {
        if (rowDiff === colDiff) {
            return isPathClear(fromRow, fromCol, toRow, toCol);
        }
        return false;
    }
    
    // Queen movement
    if (piece === '♕' || piece === '♛') {
        if (fromRow === toRow || fromCol === toCol || rowDiff === colDiff) {
            return isPathClear(fromRow, fromCol, toRow, toCol);
        }
        return false;
    }
    
    // Knight movement
    if (piece === '♘' || piece === '♞') {
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
    }
    
    // King movement
    if (piece === '♔' || piece === '♚') {
        return rowDiff <= 1 && colDiff <= 1;
    }
    
    return false;
}

// Check if path is clear between two squares
function isPathClear(fromRow, fromCol, toRow, toCol) {
    const rowStep = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
    const colStep = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;
    
    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;
    
    while (currentRow !== toRow || currentCol !== toCol) {
        if (board[currentRow][currentCol] !== '') {
            return false;
        }
        currentRow += rowStep;
        currentCol += colStep;
    }
    
    return true;
}

// Move piece
function movePiece(fromRow, fromCol, toRow, toCol) {
    board[toRow][toCol] = board[fromRow][fromCol];
    board[fromRow][fromCol] = '';
}

// Check if king is captured
function isKingCaptured() {
    const targetKing = currentTurn === 'white' ? '♔' : '♚';
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (board[row][col] === targetKing) {
                return false;
            }
        }
    }
    return true;
}

// Highlight selected square
function highlightSquare(row, col) {
    const squares = document.querySelectorAll('.square');
    squares.forEach(square => {
        if (square.dataset.row == row && square.dataset.col == col) {
            square.classList.add('selected');
        }
    });
}

// Clear highlights
function clearHighlights() {
    const squares = document.querySelectorAll('.square');
    squares.forEach(square => {
        square.classList.remove('selected');
        square.classList.remove('valid-move');
    });
}

// Update turn display
function updateTurnDisplay() {
    turnDisplay.textContent = `Turn: ${currentTurn.charAt(0).toUpperCase() + currentTurn.slice(1)}`;
}

// Reset button
resetBtn.addEventListener('click', initializeBoard);

// Initialize on load
initializeBoard();
