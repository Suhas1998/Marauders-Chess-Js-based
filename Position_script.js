var canvas = null,
	ctx = null,
	pieces = null,
	IN_PLAY = 0,
	selectedPiece = null,
	json = null;

var SELECT_LINE_WIDTH = 4,
    HIGHLIGHT_COLOUR = '#fb0006';

var SEMI_BRD_DIM = 350 ;
	BLOCK_SIZE = SEMI_BRD_DIM/5,
	PIECE_SIZE = 100;

var ROOK = 0,
    KNIGHT = 1,
    BISHOP = 2,
    KING = 3,
    BLACK = 0;

var TIME = 30,
    allow_execution = 1;

function drawPlatform(){
	canvas = document.getElementById('chess');
	ctx = canvas.getContext('2d');

	var img_p = new Image();
	img_p.src = "Platform.png";
	img_p.onload = function(){
		ctx.drawImage(img_p,SEMI_BRD_DIM/2, SEMI_BRD_DIM/4 ,2*SEMI_BRD_DIM,BLOCK_SIZE);
	}
};

function drawBoard(){
	canvas = document.getElementById('chess');
	ctx = canvas.getContext('2d');

	//First Board
 	var img1 = new Image();
 	img1.src = BLACK ? "4/board_3.png" : "1/board_1.png";
	img1.onload = function(){
		 ctx.drawImage(img1,SEMI_BRD_DIM/2, SEMI_BRD_DIM/4 + 3*BLOCK_SIZE/2 ,SEMI_BRD_DIM,SEMI_BRD_DIM);
	}
	//Second Board
	var img2 = new Image();
 	img2.src = BLACK ? "5/board_3.png" : "0/board_1.png";
	img2.onload = function(){
		 ctx.drawImage(img2,3*SEMI_BRD_DIM/2, SEMI_BRD_DIM/4 + 3*BLOCK_SIZE/2,SEMI_BRD_DIM,SEMI_BRD_DIM);
	}

}

function getImageCoords(pieceCode, bBlackTeam) {

    var imageCoords =  {
        "x": pieceCode * PIECE_SIZE,
        "y": (bBlackTeam ? 0 : PIECE_SIZE)
    };

    return imageCoords;
}

function drawPiece(curPiece, bBlackTeam){
    var imageCoords = getImageCoords(curPiece.piece, bBlackTeam);
    console.log("Image Printed");
    // Draw the piece onto the canvas
    ctx.drawImage(pieces,
        imageCoords.x, imageCoords.y,
        PIECE_SIZE, PIECE_SIZE,
        curPiece.col * BLOCK_SIZE + SEMI_BRD_DIM/2 + 5 , SEMI_BRD_DIM/4 + curPiece.row*3*BLOCK_SIZE/2 + 5,
        BLOCK_SIZE - 10 , BLOCK_SIZE - 10);
}

function drawPieces() {
	pieces = new Image();
    pieces.src = 'pieces.png';

    pieces.onload = function(){ 
    	 var iPieceCounter;
    	 var team = (BLACK ? json.black : json.white);
    	//Loop to  draw 4 pieces
    	for (iPieceCounter = 0; iPieceCounter < team.length; iPieceCounter++) {
      	  drawPiece(team[iPieceCounter], BLACK);
  	  };
    };

}

function startGame(){
	startTimer();
	drawGame();

    if (allow_execution === 0) {
        var team = BLACK ? json.black : json.white;
        setRemainingPositions(team);
        printThePositions(team);
        alert("gameover");
    }
}

function drawGame(){

	canvas = document.getElementById('chess');

	drawPlatform();

	drawBoard();

    drawPieces();
    
    canvas.addEventListener('click',board_click,false);

}

//////////////////////BOARD-CLICK FUNCTIONS//////////////////////////

function screenToBlock(x, y) {
    var block =  {
        "row": null,
        "col": null
    };

    if (x > SEMI_BRD_DIM/2 && x < 5*SEMI_BRD_DIM/2){ 
    	//Top Platform
        if( y > SEMI_BRD_DIM/4 && y< SEMI_BRD_DIM/4 + BLOCK_SIZE ){
            console.log("Platform");
            block.row = 0;
            block.col = Math.floor((x - SEMI_BRD_DIM/2) / BLOCK_SIZE);
        }
        //Board First Row Only
        else if ( y > SEMI_BRD_DIM/4 + 3*BLOCK_SIZE/2 && y< SEMI_BRD_DIM/4 + 5*BLOCK_SIZE/2 ) { 
            console.log("On the platform");
            block.row = 1;
            block.col = Math.floor((x - SEMI_BRD_DIM/2) / BLOCK_SIZE ); 
        }
    }

    console.log(block.row + " " + block.col);
    
    return block;
}

function getPieceAtBlockForTeam(teamOfPieces, clickedBlock) {

    var curPiece = null,
        iPieceCounter = 0,
        pieceAtBlock = null;

    for (iPieceCounter = 0; iPieceCounter < teamOfPieces.length; iPieceCounter++) {
        curPiece = teamOfPieces[iPieceCounter];
        if (curPiece.status === IN_PLAY &&
                curPiece.col === clickedBlock.col &&
                curPiece.row === clickedBlock.row) 
        {
            pieceAtBlock = curPiece;
            iPieceCounter = teamOfPieces.length;
        }
    }

    return pieceAtBlock;
}

function selectPiece(pieceAtBlock) {
    // Draw outline
    ctx.lineWidth = SELECT_LINE_WIDTH;
    ctx.strokeStyle = HIGHLIGHT_COLOUR;
    ctx.strokeRect((pieceAtBlock.col * BLOCK_SIZE) + SELECT_LINE_WIDTH + SEMI_BRD_DIM/2 + 3 ,
        (pieceAtBlock.row * 3*BLOCK_SIZE/2) + SELECT_LINE_WIDTH + SEMI_BRD_DIM/4 + 3,
        BLOCK_SIZE - (SELECT_LINE_WIDTH * 2) - 6,
        BLOCK_SIZE - (SELECT_LINE_WIDTH * 2) - 6) ;

    selectedPiece = pieceAtBlock;
}

function checkIfPieceClicked(clickedBlock) {
	var team = BLACK ? json.black : json.white;  
    var pieceAtBlock = getPieceAtBlockForTeam(team,clickedBlock);

    if (pieceAtBlock !== null) {
        selectPiece(pieceAtBlock);
    }
}

function removeSelection(selectedPiece) {
    // drawBlock(selectedPiece.col, selectedPiece.row);

 	 drawPiece(selectedPiece, BLACK);
}

function processMove(clickedBlock) {
    var team = BLACK ? json.black : json.white; 
    var pieceAtBlock = getPieceAtBlockForTeam(team,clickedBlock);
	
    var possible = checkWall(clickedBlock);

	if(clickedBlock.col != null && clickedBlock.row != null){ 
   		 if (pieceAtBlock !== null) {
   	    	removeSelection(selectedPiece);
    		checkIfPieceClicked(clickedBlock);
    	} 
    	else if( possible === 1 ){
    	    movePiece(clickedBlock);
    	}
        else{
            alert("Wall is Blocking");
            removeSelection(selectedPiece);
        }
    }
    else{
    	removeSelection(selectedPiece);
    	selectedPiece = null;
    }
}

function movePiece(clickedBlock) {
    // Clear the block in the original position
    // drawBlock(selectedPiece.col, selectedPiece.row);

    var team = BLACK ? json.black : json.white ;

    team[selectedPiece.piece].col = clickedBlock.col;
    team[selectedPiece.piece].row = clickedBlock.row;
    // Draw the piece in the new position
    // drawPiece(selectedPiece, !clickedBlock);
    drawGame();

    selectedPiece = null;
}

function board_click(ev) {
    if (allow_execution === 1) {
       var x = ev.clientX - canvas.offsetLeft,
            y = ev.clientY - canvas.offsetTop,
            clickedBlock = screenToBlock(x, y);

        if (selectedPiece === null) {   
            checkIfPieceClicked(clickedBlock);
        }
        else {
            processMove(clickedBlock);
        }
    }
    else{
        var team = BLACK ? json.black : json.white;
        setRemainingPositions(team);
        printThePositions(team);
        alert("gameover");
    }
}

///////////////POSITIONS OF THE PIECES////////////////////

json = 
    {
        "white": 
        [
            {
                "piece": ROOK,
                "row": 0,
                "col": 1,
                "place":0,
                "status": IN_PLAY
            },
              {
                "piece": KNIGHT,
                "row": 0,
                "col": 3,
                "place":0,
                "status": IN_PLAY
            },
            {
                "piece": BISHOP,
                "row": 0,
                "col": 6,
                "place":0,
                "status": IN_PLAY
            },
            {
                "piece": KING,
                "row": 0,
                "col": 8,
                "place":0,
                "status": IN_PLAY
            }
          
        ],
        "black": 
        [
            {
                "piece": ROOK,
                "row": 0,
                "col": 1,
                "place":0,
                "status": IN_PLAY
            },
            {
                "piece": KNIGHT,
                "row": 0,
                "col": 3,
                "place":0,
                "status": IN_PLAY
            },
            {
                "piece": BISHOP,
                "row": 0,
                "col": 6,
                "place":0,
                "status": IN_PLAY
            },
            {
                "piece": KING,
                "row": 0,
                "col": 8,
                "place":0,
                "status": IN_PLAY
            }
         
        ]       
    };


////////////TIMER RELATED/////////////////

function startTimer() {
	var seconds_left = TIME;
	var interval = setInterval(function() {
    document.getElementById('timer_div').innerHTML = --seconds_left;

    if (seconds_left <= 0)
    {
       document.getElementById('timer_div').innerHTML = " 0 ";
       clearInterval(interval);
       allow_execution = 0;
    }
}, 1000);
}

function setRemainingPositions(team){
    var toBePlacedPieces = [];
    var emptyCol = [];
    var occupiedCol = [];
    var i,j,k;
    var checkBlock = { 
        "row" : 1,
        "col" : 0
    };
    console.log(" working ");
    //Finding the pieces not placed
    for (i = 0; i < team.length; i++) {
        if(team[i].row === 1){
            occupiedCol.push( team[i].col );
        }
        else{

            toBePlacedPieces.push(i);
        }
    }    

    //Finding the empty Columns
    for (i = 0; i < 10; i++) {
        checkBlock.col = i ;
       if(checkWall(checkBlock) === 1){
            for(j = 0; j < 4 ; j++){
                if(team[j].col === i && team[j].row !== 0)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
                     break;
             }                                                             
            if (j === 4 ) {
                 emptyCol.push(i);
            }
        }
    }

    //Putting the values
    for (k = 0; k < toBePlacedPieces.length ; k++) {
        team[toBePlacedPieces[k]].col = emptyCol[k];
        team[toBePlacedPieces[k]].row = 1;
    }

}

function printThePositions(team){
    var finalCol = "final positions of Rook , Knight,Bishop and King are :" ;
    for(var l = 0; l < team.length ; l++){
        finalCol += " " + team[l].col ;
    }


    drawPlatform();
    drawBoard();
    drawPieces();

    alert(finalCol);
}

//////////////////CHECKING WALL////////////////////////
function checkWall(clickedBlock){

    var imgData = ctx.getImageData( clickedBlock.col*BLOCK_SIZE + SEMI_BRD_DIM/2 + BLOCK_SIZE/2,
                                    SEMI_BRD_DIM/4 +3*BLOCK_SIZE/2*clickedBlock.row - BLOCK_SIZE/2, 
                                    1, BLOCK_SIZE);   //choose rectangle
    var data = imgData.data;

    for (var i = 0; i < data.length; i += 4)
    { // look at all pixels

        if (data[i] === 255 && data[i + 1] === 0 && data[i + 2] === 0) { // red
            return 0;
        }
    }

    return 1;
}
















