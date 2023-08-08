// This file is released under the MIT license.
// See LICENSE.md.

var output = "";
var pretty_output = "";

var prettyOutputElement = document.getElementById('pretty-output');
var outputElement = document.getElementById('output');

function interface_wait_time_propagate() {
  speed_factor = document.getElementById("speed").value;
  return speed_factor*1000;
}

function interface_wait_time_new_board() {
  speed_factor = document.getElementById("speed").value;
  return speed_factor*1000;
}

function load_sudoku() {
  if (!board_blocked) {
    sudoku_initialize_board();
    sudoku_input = document.getElementById("sudoku-input").value;
    sudoku_load_from_string(sudoku_input);
    sudoku_render_board();
  }
}

function clear_sudoku() {
  if (!board_blocked) {
    sudoku_initialize_board();
    sudoku_render_board();
  }
}

function load_example_sudoku() {
  if (!board_blocked) {
    sudoku_initialize_board();
    sudoku_as_string = document.getElementById("example-sudokus").value;
    sudoku_load_from_string(sudoku_as_string);
    sudoku_render_board();
  }
}

can_resume = true;
function do_pause() {
  document.getElementById("pause").disabled = true;
  document.getElementById("resume").disabled = false;
  can_resume = false;
}
function do_resume() {
  document.getElementById("pause").disabled = false;
  document.getElementById("resume").disabled = true;
  can_resume = true;
}
function do_abort() {
  should_abort = true;
  do_resume();
  document.getElementById("pause").disabled = true;
  document.getElementById("resume").disabled = true;
}

function use_hidden_singles() {
  return document.getElementById("use-hidden-singles").checked;
}

function addToPrettyOutput(text) {
  pretty_output += text + "\n";
  updatePrettyOutput();
}

function clearPrettyOutput() {
  pretty_output = "";
  updatePrettyOutput();
}

function updatePrettyOutput() {
  if (prettyOutputElement) {
    prettyOutputElement.textContent = pretty_output;
    prettyOutputElement.scrollTop = prettyOutputElement.scrollHeight; // focus on bottom
  }
}
