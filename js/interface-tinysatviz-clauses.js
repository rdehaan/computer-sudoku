// This file is released under the MIT license.
// See LICENSE.md.

var inputElement = ace.edit("input");
inputElement.setTheme("ace/theme/textmate");
inputElement.$blockScrolling = Infinity;
inputElement.setOptions({
  useSoftTabs: true,
  tabSize: 2,
  maxLines: Infinity,
  autoScrollEditorIntoView: true
});

var output = "Ready..";
var pretty_output = "";

var prettyOutputElement = document.getElementById('pretty-output');
var outputElement = document.getElementById('output');

updateOutput();

var solve = async function () {

  interface_start();

  var input = inputElement.getValue();
  var solver = initSolver();

  clearOutput();
  updateOutput();

  var prop_budget = 100000;
  var conf_budget = 100000;
  var time_budget = 100000;

  var use_1uip = true;
  var use_2wl = true;

  var logger;
  logger = console.log;

  loadInput();
  solver.parse(input);
  var result = await solver.solve(logger, prop_budget, conf_budget, time_budget, use_2wl, use_1uip);

  if (result.status == SAT) {
    interface_result("SAT");
    var vline = "v"
    for (var i = 1; i < result.model.length; ++i) {
      if (result.model[i] == TRUE) {
        vline += " "+i;
      } else if (result.model[i] == FALSE) {
        vline += " -"+i;
      }
    }
    vline += "";
    // addToOutput("s SATISFIABLE");
    // addToOutput(vline);
  } else if (result.status == UNSAT) {
    interface_result("UNSAT");
    // addToOutput("s UNSATISFIABLE");
  } else {
    interface_result("ABORT");
    // addToOutput("s UNKNOWN");
  }

  interface_finish();
}

function clearOutput() {
  output = "";
}

function addToOutput(text) {
  output = text + "\n" + output;
  updateOutput();
}

function updateOutput() {
  if (outputElement) {
    var output_to_show = " ";
    if (output != "") {
      output_to_show = output;
    }
    outputElement.textContent = output_to_show;
    // outputElement.scrollTop = outputElement.scrollHeight; // focus on bottom
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

function interface_wait_time_propagate() {
  speed_factor = document.getElementById("speed").value;
  return speed_factor*500;
}

function interface_wait_time_propagate_round() {
  speed_factor = document.getElementById("speed").value;
  return speed_factor*0;
}

function interface_wait_time_decide() {
  speed_factor = document.getElementById("speed").value;
  return speed_factor*1000;
}

function interface_wait_time_learn() {
  speed_factor = document.getElementById("speed").value;
  return speed_factor*1000;
}

function interface_wait_time_backjump() {
  speed_factor = document.getElementById("speed").value;
  return speed_factor*1000;
}

function interface_wait_time_conflict() {
  speed_factor = document.getElementById("speed").value;
  return speed_factor*500;
}

var cur_level = 0;
var cur_assignment = [];
var display_assignment = {};

function interface_start() {
  should_abort = false;
  document.getElementById("btn_solve").disabled = true;
  document.getElementById("btn_pause").disabled = false;
  document.getElementById("btn_resume").disabled = true;

  clearPrettyOutput();
  addToPrettyOutput("Solving..");

  cur_level = 0;
  cur_assignment = [];
  display_assignment = {};
  displayClauses();
}

function interface_assign(lit) {
  if (!should_abort) {
    console.log("ASSIGNING: " + lit);
    assignLiteral(lit);
  }
}

function interface_unassign(lit) {
  if (!should_abort) {
    console.log("UNASSIGNING: " + lit);
    unassignLiteral(lit);
  }
}

function interface_done_propagating() {
}

function interface_propagate(lit) {
  console.log("PROPAGATING: " + lit);
  cur_assignment.push({
    level: cur_level,
    lit: lit,
    type: "prop",
  });
  addToOutput("Propagating literal: " + lit);
  interface_assign(lit);
}

function interface_conflict(clause) {
  console.log("CONFLICT: [" + clause + "]");
  addToOutput("Clause made false: [" + clause + "]");
}

function interface_learned_clause(clause) {
  if (!should_abort) {
    console.log("LEARNED CLAUSE: [" + clause + "]");
    clauses.push(clause);
    addToOutput("Learned new clause: [" + clause + "]");
    displayClauses();
  }
}

function interface_analyze(conflict_graph) {
  console.log(conflict_graph);
}

function interface_backjump(level) {
  console.log("BACKJUMPING TO LEVEL: " + level);
  var num_levels_backjump = cur_level - level;
  var list_unassigned_decisions = [];
  var list_unassigned_propagations = [];
  cur_level = level;
  for (let i = cur_assignment.length-1; i >= 0; i--) {
    if (cur_assignment[i].level > level) {
      if (cur_assignment[i].type == "decide") {
        list_unassigned_decisions.push(cur_assignment[i].lit);
      } else {
        list_unassigned_propagations.push(cur_assignment[i].lit);
      }
      interface_unassign(cur_assignment[i].lit);
    }
  }
  cur_assignment = cur_assignment.filter(obj =>
    obj.level <= level
  );
  addToOutput("Undoing the last " + num_levels_backjump + " chosen literals (" + list_unassigned_decisions + ") and corresponding propagated literals (" + list_unassigned_propagations + ")");
}

function interface_decide(lit) {
  console.log("DECIDING: " + lit);
  cur_level += 1;
  cur_assignment.push({
    level: cur_level,
    lit: lit,
    type: "decide",
  });
  addToOutput("Branching by assigning literal: " + lit);
  interface_assign(lit);
}

function interface_result(result) {
  if (result == "SAT") {
    console.log("SATISFIABLE");
    addToOutput("Found a satisfying assignment: [" + cur_assignment.map(obj => obj.lit) + "]");
    addToPrettyOutput("Found satisfying assignment!");
  } else if (result == "UNSAT") {
    console.log("UNSATISFIABLE");
    addToOutput("No more choices to undo, formula is unsatisfiable!");
    addToPrettyOutput("Result: unsatisfiable!");
  } else if (result == "ABORT") {
    console.log("ABORTED");
    addToOutput("Aborted the search..");
  }
}

function interface_finish() {
  document.getElementById("btn_solve").disabled = false;
  document.getElementById("btn_pause").disabled = true;
  document.getElementById("btn_resume").disabled = true;
}

var can_continue = true;
var should_abort = false;

function do_pause() {
  can_continue = false;
  document.getElementById("btn_pause").disabled = true;
  document.getElementById("btn_resume").disabled = false;
}

function do_resume() {
  can_continue = true;
  document.getElementById("btn_pause").disabled = false;
  document.getElementById("btn_resume").disabled = true;
}

function do_abort() {
  should_abort = true;
  do_resume();
  document.getElementById("btn_pause").disabled = true;
  document.getElementById("btn_resume").disabled = true;
}

function do_reset() {
  do_abort();
  loadInput();
  clearPrettyOutput();
  addToPrettyOutput("Ready..");
}

// The following three functions are taken (in modified form) from:
// https://github.com/psaikko/tinysat

function isWhitespace(c) {
  return (c == '\t') || (c == '\n') || (c == ' ');
}

function skipWhitespace(text, i) {
  while (i < text.length && isWhitespace(text[i])) ++i;
  return i;
}

// parse cnf format instance
function parse_cnf(text) {
  var clauses = [];
  var i = 0;
  var maxVar = 0;
  while (i < text.length) {
    i = skipWhitespace(text, i);
    if (i == text.length) break;

    if (text[i] == 'c') {
      while(text[i++] != '\n' && i < text.length) ;
    } else if (text[i] == 'p') {
      while(text[i++] != '\n' && i < text.length) ;
    } else {
      var clause = []
      var lit = 0;
      while (i < text.length) {
        var j = 0;
        while (!isWhitespace(text[i+j]) && i+j < text.length)
          ++j;
        lit = parseInt(text.substring(i, i+j))
        if (lit != 0) {
          maxVar = Math.max(maxVar, Math.abs(lit))
          clause.push(lit);
          i = skipWhitespace(text, i+j);
        } else {
          i += j;
          break;
        }
      }
      clauses.push(clause);
    }
  }
  return clauses;
}

function resetAssignment() {
  display_assignment = {};
  displayClauses();
}

function assignLiteral(lit) {
  var varnum = Math.abs(lit);
  var positive = true;
  if (lit < 0) {
    positive = false;
  }
  display_assignment[varnum] = {
    positive: positive,
  }
  displayClauses();
}

function unassignLiteral(lit) {
  var varnum = Math.abs(lit);
  display_assignment[varnum] = null;
  displayClauses();
}

function getTruthValue(input) {
  if (Array.isArray(input)) {
    // Check truth value of clause
    var clause = input;
    var all_lits_false = true;
    for (let j = 0; j < clause.length; j++) {
      var lit = clause[j];
      var value = getTruthValue(lit);
      if (value != null && value) {
        return true;
      } else if (value == null) {
        all_lits_false = false;
      }
    }
    if (all_lits_false) {
      return false;
    }
    return null;
  } else {
    // Check truth value of literal
    var lit = input;
    var varnum = Math.abs(lit);
    var positive = true;
    if (lit < 0) {
      positive = false;
    }
    var value = display_assignment[varnum];
    if (value == null) {
      return null;
    }
    return (value.positive == positive);
  }
}

function loadInput() {
  clauses = parse_cnf(inputElement.getValue());
  resetAssignment();
}

function displayClauses() {
  html_string = "";
  for (let i = 0; i < clauses.length; i++) {
    clause = clauses[i];
    var class_string = "clause";
    if (getTruthValue(clause) != null && getTruthValue(clause)) {
      class_string += " trueclause";
    } else if (getTruthValue(clause) != null && !getTruthValue(clause)) {
      class_string += " falseclause";
    } else {
      class_string += " openclause";
    }
    html_string += "<ul class='" + class_string + "'>";
    for (let j = 0; j < clause.length; j++) {
      lit = clause[j];
      var class_string = "literal";
      if (getTruthValue(lit) != null && getTruthValue(lit)) {
        class_string += " truelit";
      } else if (getTruthValue(lit) != null && !getTruthValue(lit)) {
        class_string += " falselit";
      } else {
        class_string += " openlit";
      }
      html_string += "<li class='" + class_string + "' "
      // html_string += "onclick='assignLiteral(" + lit + ")' ";
      html_string += ">";
      if (lit < 0) {
        html_string += "&not;" + -1*lit;
      } else {
        html_string += lit;
      }
      html_string += "</li>";
      if (j < clause.length-1) {
        html_string += "<li>&or;</li>";
      }
    }
    html_string += "</ul>";
  }
  document.getElementById("formula").innerHTML = html_string;
}

do_reset();
