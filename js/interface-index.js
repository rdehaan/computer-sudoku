// This file is released under the MIT license.
// See LICENSE.md.

function interface_new_board(new_board) {
  console.log("Interface: new board");
  board = new_board;
  sudoku_render_board();
}

function interface_model(board) {
  model_found = true;
  console.log("Interface: model");
  addToPrettyOutput("Found solution! :)");
  var index = document.getElementById("mode").selectedIndex;
  var enumerate_all = false;
  if (index == 1) {
    enumerate_all = true;
  }
  if (enumerate_all && document.getElementById("pause-on-model").checked) {
    do_pause();
  } else if (!enumerate_all) {
    do_abort();
  }
}

function interface_before_start() {
  console.log("Interface: before start");
  clearPrettyOutput();
  addToPrettyOutput("Solving..");
  sudoku_initialize_candidates();
  sudoku_render_board();
}

function interface_start() {
  console.log("Interface: start");
  document.getElementById("run").disabled = true;
  document.getElementById("pause").disabled = false;
  document.getElementById("resume").disabled = true;
  should_abort = false;
  board_blocked = true;
  do_resume();
}

function interface_finish() {
  console.log("Interface: finish");
  document.getElementById("run").disabled = false;
  document.getElementById("pause").disabled = true;
  document.getElementById("resume").disabled = true;
  board_blocked = false;
}

function do_reset() {
  do_abort();
  sudoku_initialize_board();
  sudoku_load_from_string("070000000201050000053600000084300067500010008730004210000002670000030405000000090");
  sudoku_render_board();
  board_blocked = false;
  clearPrettyOutput();
  addToPrettyOutput("Ready..");
}

do_reset();
