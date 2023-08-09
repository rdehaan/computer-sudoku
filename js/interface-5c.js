// This file is released under the MIT license.
// See LICENSE.md.

var input = ace.edit("input");
var ex = document.getElementById("examples");
var explElem = document.getElementById("explanation");

explanations = {
  "encodings/simple1.lp": `
  This explains simple1.lp.
  `,
  "encodings/simple2.lp": `
  This explains simple2.lp.
  `,
  "encodings/heuristic3.lp": `
  This explains heuristic3.lp.
  `,
}

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
  load_explanation(ex.value);
}

load_example();

function load_explanation(key) {
  var explanation = explanations[key];
  explElem.innerHTML = explanation;
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
