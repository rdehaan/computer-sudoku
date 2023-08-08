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

function solve() {
  interface_before_start();
  options = "";
  var index = document.getElementById("mode").selectedIndex;
  if (index >= 0) {
    if (index == 1) {
      options += " --opt-mode=optN 0";
    }
  }
  var index = document.getElementById("heuristic").selectedIndex;
  if (index == 0) {
    options += " --heuristic=Domain"
  } else if (index == 1) {
    options += " --heuristic=Berkmin"
  } else if (index == 2) {
    options += " --heuristic=Vmtf"
  } else if (index == 3) {
    options += " --heuristic=Vsids"
  } else if (index == 4) {
    options += " --heuristic=Unit"
  } else if (index == 5) {
    options += " --heuristic=None"
  }
  restart_num = document.getElementById("restarts").valueAsNumber;
  if (restart_num != NaN && restart_num >= 1) {
    options += " --restarts F," + restart_num;
  }
  more_options = document.getElementById("more-options").value;
  if (more_options != "") {
    options += " " + more_options;
  }
  output = "";
  Clingo.ccall('run', 'number', ['string', 'string', 'string'], [input.getValue() + hidden_program, options, watched_predicates()])
  updateOutput();
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

Clingo = {
  preRun: [],
  postRun: [],
  print: (function() {
    return function(text) {
      if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
      output += text + "\n";
    };
  })(),
  printErr: function(text) {
    if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
    if (text == "Calling stub instead of signal()") { return; }
    var prefix = "pre-main prep time: ";
    if (typeof text=="string" && prefix == text.slice(0, prefix.length)) { text = "Ready to go!" }
    output += text + "\n";
    updateOutput();
  },
  setStatus: function(text) {
    if (text == "") { runButton.disabled = false; }
    else {
      output += text + "\n";
      updateOutput();
    }
  },
  totalDependencies: 0,
  monitorRunDependencies: function(left) {
    this.totalDependencies = Math.max(this.totalDependencies, left);
    Clingo.setStatus(left ? 'Preparing... (' + (this.totalDependencies-left) + '/' + this.totalDependencies + ')' : 'All downloads complete.');
    addToPrettyOutput(left ? "Preparing.." : "All downloads complete..");
  }
};
Clingo.setStatus('Downloading...');
addToPrettyOutput("Downloading..");
window.onerror = function(event) {
  Clingo.setStatus('Exception thrown, see JavaScript console');
  addToPrettyOutput("Something went wrong.. :(");
};

// Initialize Emscripten Module
Module = Module(Clingo);

var QueryString = function () {
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
      query_string[pair[0]] = arr;
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  }
  return query_string;
}();

if (QueryString.example !== undefined) {
  ex.value = "/clingo/run/examples/" + QueryString.example;
  load_example("/clingo/run/examples/" + QueryString.example);
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

function interface_register_watch(lit, atom) {
  lit_to_atom[lit] = atom;
  console.log("Interface: registered watch " + atom + " (" + lit + ")");
}
function interface_propagate(lit) {
  if (!need_to_update_graphics()) {
    return;
  }
  atom = get_atom_from_lit(lit);
  console.log("Interface: propagate " + lit + " " + atom);
  atom_obj = parse_sudoku_atom(atom);
  if (atom_obj != null && !atom_obj.auxiliary && atom_obj.positive) {
    sudoku_set_cell_value(atom_obj.i, atom_obj.j, atom_obj.val);
  } else if (atom_obj != null && !atom_obj.auxiliary && !atom_obj.positive) {
    sudoku_remove_candidate(atom_obj.i, atom_obj.j, atom_obj.val);
  }
  sudoku_render_board();
}
function interface_undo(lit) {
  if (!need_to_update_graphics()) {
    return;
  }
  var atom = get_atom_from_lit(lit);
  console.log("Interface: undo " + lit + " " + atom);
  var atom_obj = parse_sudoku_atom(atom);
  if (atom_obj != null && !atom_obj.auxiliary && atom_obj.positive) {
    sudoku_set_cell_value(atom_obj.i, atom_obj.j, null);
  } else if (atom_obj != null && !atom_obj.auxiliary && !atom_obj.positive) {
    sudoku_add_candidate(atom_obj.i, atom_obj.j, atom_obj.val);
  }
  sudoku_render_board();
}
function interface_decide(lit) {
  atom = get_atom_from_lit(lit);
  console.log("Interface: decide " + lit + " " + atom);
}
function interface_check(model) {
  atoms = Array();
  for (let index = 0; index < model.length; ++index) {
    atom = get_atom_from_lit(model[index]);
    if (atom != null) {
      atom_obj = parse_sudoku_atom(atom);
      if (atom_obj != null && !atom_obj.auxiliary && atom_obj.positive) {
        sudoku_set_cell_value(atom_obj.i, atom_obj.j, atom_obj.val);
      }
      if (atom.startsWith("solution(" || atom.startsWith("-solution("))) {
        atoms.push(atom);
      }
    }
  }
  sudoku_render_board();
  model_found = true;
  console.log("Interface: check " + atoms);
  updateOutput();
  if (need_to_update_graphics() && document.getElementById("pause-on-model").checked) {
    do_pause();
  }
}
function interface_on_model() {
  console.log("Interface: on_model");
  addToPrettyOutput("Found solution! :)");
}
// function interface_on_unsat() {
//   console.log("Interface: on_unsat");
// }
// function interface_on_finish() {
//   console.log("Interface: on_finish");
// }
function interface_before_start() {
  console.log("Interface: before start");
  clearPrettyOutput();
  addToPrettyOutput("Solving..");
  lit_to_atom = {};
  model_found = false;
  sudoku_initialize_candidates();
  sudoku_render_board();
  hidden_program = "";
  for (var i=0; i < board_size; i++) {
    for (var j=0; j < board_size; j++) {
      val = sudoku_get_cell_value(i,j);
      if (val != null) {
        hidden_program += "solution("+(i+1)+","+(j+1)+","+val+").\n"
      }
    }
  }
}
function watched_predicates() {
  return "solution *";
}
function interface_start() {
  console.log("Interface: start");
  document.getElementById("run").disabled = true;
  document.getElementById("pause").disabled = false;
  board_blocked = true;
  do_resume();
}
function interface_finish() {
  console.log("Interface: finish");
  document.getElementById("run").disabled = false;
  document.getElementById("pause").disabled = true;
  document.getElementById("resume").disabled = true;
  board_blocked = false;
  updateOutput();
  speed_factor = document.getElementById("speed").value;
  setTimeout(function() {
    updateOutput();
  }, speed_factor*500);
  setTimeout(function() {
    updateOutput();
  }, speed_factor*1000);
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

sudoku_initialize_board();
sudoku_load_from_string("120400300300010050006000100700090000040603000003002000500080700007000005000000098"); // Extremely hard 1
sudoku_render_board();
board_blocked = false;
load_example_from_path("encodings/heuristic3.lp");
