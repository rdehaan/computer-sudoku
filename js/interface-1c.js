// This file is released under the MIT license.
// See LICENSE.md.

// This file is released under the MIT license.
// See LICENSE.md.
//
// The code in this file was inspired by:
// https://github.com/pocketjoso/sudokuJS

board_size = 9;

function sudoku_initialize_board() {
	var board = Array()
	for(var j=0; j < board_size*board_size ; j++){
		board[j] = {
			val: null,
			candidates: []
		};
	}
  return board;
}

function sudoku_render_cell(cell, id){
	var val = (cell.val === null) ? "" : cell.val;
	var candidates = cell.candidates || [];
	return "<div class='sudoku-board-cell'>" +
				"<input type='text' pattern='\\d*' novalidate id='input-"+id+"' value='"+val+"' disabled>" +
				"<div id='input-"+id+"-candidates' class='candidates'></div>" +
				"</div>";
};

function sudoku_render_board(board) {
	var htmlString = "";
	for(var i=0; i < board_size*board_size; i++){
		htmlString += sudoku_render_cell(board[i], i);
		if((i+1) % board_size === 0) {
			htmlString += "<br>";
		}
	}
  return htmlString;
}

function sudoku_show_from_string(sudoku_as_string, index) {
	var board = sudoku_initialize_board();
  console.log(board);
	for (var i=0; i < board_size*board_size && i < sudoku_as_string.length; i++){
		if (sudoku_as_string[i] >= '1' && sudoku_as_string[i] <= '9') {
			board[i].val = sudoku_as_string[i];
		}
	}
  var htmlString = sudoku_render_board(board);
  var board_elems = document.getElementsByClassName('sudoku-board');
	var board_elem = board_elems[index];
	board_elem.innerHTML = htmlString;
}

sudoku_show_from_string("070000000201050000053600000084300067500010008730004210000002670000030405000000090", 0);

sudoku_show_from_string("120400300300010050006000100700090000040603000003002000500080700007000005000000098", 1);
