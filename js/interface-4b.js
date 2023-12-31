// This file is released under the MIT license.
// See LICENSE.md.

clearPrettyOutput();
addToPrettyOutput("Ready.. ");

function do_reset() {
  do_abort();
  sudoku_initialize_board();
  sudoku_load_from_string("070000000201050000053600000084300067500010008730004210000002670000030405000000090"); // Hodoku Rating: 1836
  sudoku_render_board();
  board_blocked = false;
  clearPrettyOutput();
  addToPrettyOutput("Ready..");
}

do_reset();
