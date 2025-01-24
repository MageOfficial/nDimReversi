export default function Game(dim, size=4) {
    this.dim = dim;
    this.size = size;
    this.player = 0;

    if (size <= 2 || size % 2 !== 0) {
        throw new Error('Size must be defined, even and, greater than 2');
    }

    function generateDirections() {
        const directions = [];
        const recurse = (currentDir = [], depth = 0) => {
            if (depth === dim) {
                if (currentDir.some(coord => coord !== 0)) {
                    directions.push(currentDir);
                }
                return;
            }
            for (let d = -1; d <= 1; d++) {
                recurse([...currentDir, d], depth + 1);
            }
        };
        recurse();
        return directions;
    }

    const directions = generateDirections();
    
    const totalElements = Math.pow(size, dim);
    this.board = [
        new Uint8Array(Math.ceil(totalElements / 8)), // Black
        new Uint8Array(Math.ceil(totalElements / 8)), // White
        new Uint8Array(Math.ceil(totalElements / 8)).fill(255)  // Empty
    ];

    this.potentialMoves = [
        new Uint8Array(Math.ceil(totalElements / 8)),
        new Uint8Array(Math.ceil(totalElements / 8))
    ]

    this.flattenIndex = function(coords) {
        return coords.reduce((index, coord) => index * size + coord, 0);
    }

    this.unflattenIndex= function(index) {
        const coords = [];
        for (let i = 0; i < this.dim; i++) {
            coords.unshift(index % this.size);
            index = Math.floor(index / this.size);
        }
        return coords;
    }

    this.get = function (coords) {
        const index = this.flattenIndex(coords);
        if (getBit(this.board[2], index)) {
            return 2;
        } 
        else{
            return 1-getBit(this.board[0], index)
        }
    };

    this.getMoves = function (coords, player) {
        const index = this.flattenIndex(coords);
        return getBit(this.potentialMoves[player], index)
    };

    this.set = function (coords, val) {
        const index = this.flattenIndex(coords);
        setBit(this.board[2], index, 0);
        setBit(this.board[1-val], index, 0);
        setBit(this.board[val], index, 1);

    };

    function setBit(array, index, value) {
        const byteIndex = Math.floor(index / 8);
        const bitOffset = index % 8;
    
        // Check if byteIndex is within the array bounds
        if (byteIndex >= array.length) {
            console.error(`Index ${byteIndex} is out of bounds for array of length ${array.length}`);
            return;
        }
    
        if (value) {
            // Set the bit at bitOffset to 1
            array[byteIndex] |= (1 << bitOffset);
        } else {
            // Set the bit at bitOffset to 0
            array[byteIndex] &= ~(1 << bitOffset);
        }
    }
    
    function getBit(array, index) {
        const byteIndex = Math.floor(index / 8);
        const bitOffset = index % 8;
        
        // Check if byteIndex is within the array bounds
        if (byteIndex >= array.length) {
            console.error(`Index ${byteIndex} is out of bounds for array of length ${array.length}`);
            return 0;
        }
    
        return (array[byteIndex] >> bitOffset) & 1;
    }
    
    // Initialize starting positions
    function startPosSetup(game, curDim = 1, flip = true, baseCoords = []) {
        if (curDim === dim) {
            const mid = Math.floor(size / 2);

            game.set([...baseCoords, mid], Number(flip));
            game.set([...baseCoords, mid - 1], Number(!flip));
            return;
        }

        const mid = Math.floor(size / 2);
        startPosSetup(game, curDim + 1, !flip, [...baseCoords, mid]);
        startPosSetup(game, curDim + 1, flip, [...baseCoords, mid - 1]);
    }

    startPosSetup(this);

    for (let i=0; i<totalElements;i++){
        if(getBit(this.board[2], i)) continue
        
        let oldSq= this.unflattenIndex(i)
        let val=this.get(oldSq)

        directions.forEach((dir) => { 
            var newIdx=this.flattenIndex(oldSq.map((num, j)=>num+dir[j]))
            if(getBit(this.board[2], newIdx)){
                setBit(this.potentialMoves[1-val], newIdx, 1)
            }
        })
    }

    this.pass = function (){
        this.player=1-this.player
    }

    this.makeMove = function (sq){
        if(!getBit(this.board[2], this.flattenIndex(sq))) {
            console.log("already filled")
            return false
        }
        //Recursively send rays out and then flip everything
        function flipDir(game, dir, sq, dist=0){
            //Bounds Check
            for(var i=0; i<dim; i++){
                if(sq[i]<0||sq[i]>=game.size) return false
            }

            var sqIdx = game.flattenIndex(sq)
            if(getBit(game.board[1-game.player], sqIdx) && flipDir(game, dir, sq.map((num, i)=>num+dir[i]), i++) ) {
                game.set(sq, game.player)
                return true
            }
            else if(dist>0&&getBit(game.board[game.player], sqIdx))  {
                return true
            }
            else if(dist===0 &&getBit(game.board[2], sqIdx)) {
                //TODO: Invalid move will set this
                setBit(game.potentialMoves[1-game.player], sqIdx, 1)
            }
            return false
        }

        // Check all directions for valid flips
        var res = false
        directions.forEach(dir => {
            var tempRes=flipDir(this, dir, sq.map((num, i)=>num+dir[i]));
            res||=tempRes
        });

        if(res===false){
            console.log("Invalid Move")
            return false
        };
        
        var sqIdx=this.flattenIndex(sq)
        
        setBit(this.board[this.player], sqIdx, 1) //Set Piece
        setBit(this.board[2], sqIdx, 0) //Set empty to filled

        setBit(this.potentialMoves[1-this.player], sqIdx, 0) //Remove potential move
        setBit(this.potentialMoves[this.player], sqIdx, 0)

        this.player=1-this.player
        //Move Successful
        return true
    }

    /*Maybe implement later to generate moves lazily for only the viewable portion of the game
    this.generateMoves = function(){
    
    }
    */

   return this
}

