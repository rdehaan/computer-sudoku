// This file is released under the MIT license.
// See LICENSE.md.

var Clingo = {};
var outputElement = document.getElementById('output');
var runButton = document.getElementById('run');
var input = ace.edit("input");
var ex = document.getElementById("examples");
var output = "";
var pretty_output = "";

var prettyOutputElement = document.getElementById('pretty-output');
var outputElement = document.getElementById('output');

input.setTheme("ace/theme/textmate");
input.$blockScrolling = Infinity;
input.setOptions({
  useSoftTabs: true,
  tabSize: 2,
  maxLines: Infinity,
  mode: "ace/mode/gringo",
  autoScrollEditorIntoView: true
});

function load_example() {
  load_example_from_path(ex.value);
}

function load_example_from_path(path) {
  var request = new XMLHttpRequest();
  request.onreadystatechange = function() {
    if (request.readyState == 4 && request.status == 200) {
      input.setValue(request.responseText.trim(), -1);
    }
  }
  request.open("GET", path, true);
  request.send();
}

function clearOutput() {
  output = "";
  updateOutput();
}

function updateOutput() {
  if (outputElement) {
    outputElement.textContent = output;
    outputElement.scrollTop = outputElement.scrollHeight; // focus on bottom
  }
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

hidden_program = "";

lit_to_atom = {};
model_found = false;

function get_atom_from_lit(lit) {
  if (lit > 0) {
    atom = lit_to_atom[lit];
  }
  else {
    atom = "-" + lit_to_atom[-lit];
  }
  if (atom == null) {
    if (lit > 0) {
      atom = "aux(" + lit +")";
    } else {
      atom = "-aux(" + -lit + ")";
    }
  }
  return atom;
}

function interface_wait_time_propagate() {
  if (!need_to_update_graphics()) {
    return 0;
  }
  speed_factor = document.getElementById("speed").value;
  return speed_factor*1000;
}
function interface_wait_time_undo() {
  if (!need_to_update_graphics()) {
    return 0;
  }
  speed_factor = document.getElementById("speed").value;
  return speed_factor*1000;
}
function interface_wait_time_check() {
  if (!need_to_update_graphics()) {
    return 0;
  }
  speed_factor = document.getElementById("speed").value;
  return speed_factor*2000;
}
function interface_wait_time_on_model() {
  if (!need_to_update_graphics()) {
    return 0;
  }
  speed_factor = document.getElementById("speed").value;
  return speed_factor*0;
}
function interface_wait_time_decide() {
  if (!need_to_update_graphics()) {
    return 0;
  }
  speed_factor = document.getElementById("speed").value;
  return speed_factor*500;
}

function parse_sudoku_atom(atom) {
  parts = atom.split(/,|\(|\)/)
  if (atom.startsWith("solution(")) {
    i = parseInt(parts[1]);
    j = parseInt(parts[2]);
    v = parseInt(parts[3]);
    return {
      i: i-1,
      j: j-1,
      val: v,
      auxiliary: false,
      positive: true,
    }
  } else if (atom.startsWith("-solution(")) {
    i = parseInt(parts[1]);
    j = parseInt(parts[2]);
    v = parseInt(parts[3]);
    return {
      i: i-1,
      j: j-1,
      val: v,
      auxiliary: false,
      positive: false,
    }
  } else if (atom.startsWith("-")) {
    name = atom.slice(1);
    return {
      name: name,
      positive: false,
      auxiliary: true,
    }
  } else {
    return {
      name: atom,
      positive: true,
      auxiliary: true,
    }
  }
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

Module.can_resume = true;
function do_pause() {
  document.getElementById("pause").disabled = true;
  document.getElementById("resume").disabled = false;
  Module.can_resume = false;
}
function do_resume() {
  document.getElementById("pause").disabled = false;
  document.getElementById("resume").disabled = true;
  Module.can_resume = true;
}

function need_to_update_graphics() {
  var index = document.getElementById("mode").selectedIndex;
  if (index == 0 && model_found == true) {
    return false;
  }
  return true;
}
