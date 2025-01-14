game=new Game(8,8)
console.log(game.board)
//game.makeMove([3,2,1,2])
//console.log(game.board)
board=game.board



function Game(dim, size=4) {
    this.dim = dim;
    this.size = size;
    this.player = 0;
    var potentialMoves = [new Set(),new Set()]

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

    function flattenIndex(coords) {
        return coords.reduce((index, coord) => index * size + coord, 0);
    }

    function unflattenIndex(index) {
        const coords = [];
        for (let i = 0; i < this.dim; i++) {
            coords.unshift(index % this.size);
            index = Math.floor(index / this.size);
        }
        return coords;
    }

    this.get = function (coords) {
        const index = flattenIndex(coords);
        if (getBit(this.board[2], index)) {
            return 2;
        } 
        else{
            return 1-getBit(this.board[0], index)
        }
    };

    this.set = function (coords, val) {
        const index = flattenIndex(coords);
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

    for (i=0; i<totalElements;i++){
        if(getBit(this.board[2], i)) continue
        
        var oldSq= unflattenIndex(i)
        var val=this.get(oldSq)
        directions.forEach(dir => { 
            newSq = oldSq.map((num, j)=>num+dir[j])
            if(getBit(this.board[2], i)){
                potentialMoves[1-val].add(newSq)
            }
        })
    }

    this.makeMove = function (sq){
        //Recursively send rays out and then flip everything
        function flipDir(game, dir, sq, dist=0){
            //Bounds Check
            for(var i=0; i<dim-1; i++){
                if(sq[i]<0||sq[i]>=size) return false
            }
            
            var sqIdx = unflattenIndex(sq)
            if(getBit(game.board[1-game.player], sqIdx) && flipDir(game, dir, sq.map((num, i)=>num+dir[i]), i++) ) {
                game.set(sq, game.player)
                return true
            }
            else if(getBit(game.board[game.player], sqIdx))  {
                return true
            }
            else if(dist==0 &&getBit(game.board[2], sqIdx)) {
                potentialMoves[1-game.player].add(sq)
            }
            return false
        }

        // Check all directions for valid flips
        var res = directions.some(dir => {
            return flipDir(this, dir, sq.map((num, i)=>num+dir[i]));
        });

        if(res==false) throw new Error("Invalid Move");

        this.set(sq, this.player)
        this.player=1-this.player
        potentialMoves[this.player].delete(sq)
    }

    /*Maybe implement later
    this.generateMoves = function(){
    
    }
    */

   return this
}


