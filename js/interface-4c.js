// This file is released under the MIT license.
// See LICENSE.md.

clearPrettyOutput();
addToPrettyOutput("Ready.. ");

function do_reset() {
  do_abort();
  sudoku_initialize_board();
  sudoku_load_from_string("120400300300010050006000100700090000040603000003002000500080700007000005000000098"); // Extremely hard 1
  sudoku_render_board();
  board_blocked = false;
  clearPrettyOutput();
  addToPrettyOutput("Ready..");
}

do_reset();
