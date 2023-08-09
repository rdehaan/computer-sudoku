// This file is released under the MIT license.
// See LICENSE.md.

solver_running = false;

input.getSession().on('change', function() {
  localStorage.setItem("page-5d-encoding", input.getValue());
});
ex.addEventListener('change', function() {
 localStorage.setItem("page-5d-encoding-choice", ex.value);
});

var stored_input = localStorage.getItem("page-5d-encoding");
if (stored_input) {
  input.setValue(stored_input);
  input.execCommand("gotolineend");
  ex.value = localStorage.getItem("page-5d-encoding-choice");
  console.log(localStorage.getItem("page-5d-encoding-choice"));
} else {
  load_example_from_path("encodings/heuristic3.lp");
}

// input.container.style.pointerEvents="none";
input.setOptions({
    readOnly: true,
    highlightActiveLine: false,
    highlightGutterLine: false
});
// input.container.style.opacity=0.75;
// input.renderer.setStyle("disabled", true);
// input.blur()

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
  solver_running = true;
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
  solver_running = false;
}

function relead_board() {
  sudoku_initialize_board();
  sudoku_load_from_string("120400300300010050006000100700090000040603000003002000500080700007000005000000098"); // Extremely hard 1
  sudoku_render_board();
}

function do_reset() {
  if (solver_running) {
    document.getElementById("pause").disabled = true;
    document.getElementById("resume").disabled = true;
    window.location.reload();
  } else {
    relead_board();
    clearPrettyOutput();
    addToPrettyOutput("Ready..");
  }
}

relead_board();
board_blocked = false;
