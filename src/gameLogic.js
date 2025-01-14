game=new Game(4,4)
game.makeMove([3,2,1,2])

board=game.board
console.log(board)

console.log(board[0])
console.log(board[1])
console.log(board[2])
console.log(board[3])


function Game(dim, size=4){
    this.dim=dim
    this.size=size
    this.player=0

    if (size <= 2 || size % 2 !== 0) {
        throw new Error('Size must be defined, even and, greater than 2');
    }

    //Recursively create an n-Dimensional array with all squares set to 0 for being empty
    function createBoard(curDim = 1) {
        if (curDim === dim) {
            return Array(size).fill(2);
        }

        var arr=Array(size).fill(null).map(()=>createBoard(curDim+1))
        return arr
    }

    this.board=createBoard();

    //Recursively fill in the middle 2x2x... while making sure no pieces of the same color are touching
    function startPosSetup(arr, curDim = 1, flip=true) {
        if (curDim === dim) {
            arr[size/2]=Number(flip)
            arr[size/2-1]=Number(!flip)
            return
        }
        
        //Choose two middle rows
        startPosSetup(arr[size/2], curDim +1, !flip)
        startPosSetup(arr[size/2-1], curDim +1,flip)
    }

    startPosSetup(this.board)
    
    // List of all possible directions for rays in n-dimensions
    function generateDirections() {
        const directions = [];
        const recurse = (currentDir = [], depth = 0) => {
            if (depth === dim) {
                // Exclude the zero direction
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

    this.makeMove = function (sq){
        var curArr=this.board
        for(var i=0; i<dim-1; i++){
            curArr=curArr[sq[i]]
        }
        curArr[sq[dim-1]]=this.player

        //Recursively send rays out and then flip everything
        function flipDir(board, player, dir, sq){
            var curArr=board
            for(var i=0; i<dim-1; i++){
                if(sq[i]<0||sq[i]>=curArr.length) return false
                curArr=curArr[sq[i]]
            }
            
            if(curArr[sq[dim-1]]==1-player) {
                if (flipDir(board, player, dir, sq.map((num, i)=>num+dir[i]))){
                    curArr[sq[dim-1]]=player
                    return true
                }
            }
            else if(curArr[sq[dim-1]]==player)  {
                return true
            }
            return false
        }

        // Check all directions for valid flips
        directions.forEach(dir => {
            flipDir(this.board, this.player, dir, sq.map((num, i)=>num+dir[i]));
        });

        this.player=1-this.player
    }

    this.generateMoves = function(){

        function flipDir(board, player, dir, sq){
            var curArr=board
            for(var i=0; i<dim-1; i++){
                if(sq[i]<0||sq[i]>=curArr.length) return false
                curArr=curArr[sq[i]]
            }
            
            if(curArr[sq[dim-1]]==1-player) {
                if (flipDir(board, player, dir, sq.map((num, i)=>num+dir[i]))){
                    curArr[sq[dim-1]]=player
                    return true
                }
            }
            else if(curArr[sq[dim-1]]==player)  {
                return true
            }
            return false
        }

        // Check all directions for valid flips
        directions.forEach(dir => {
            flipDir(this.board, this.player, dir, sq.map((num, i)=>num+dir[i]));
        });

        this.player=1-this.player
    }

   return this
}


