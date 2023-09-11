// This file is released under the MIT license.
// See LICENSE.md.

var cur_line = 1;
var program_elems = document.getElementsByClassName("program");
for (var i = 0; i < program_elems.length; i++) {
  var input = ace.edit(program_elems.item(i));
  input.setOption("firstLineNumber", cur_line)
  input.setTheme("ace/theme/textmate");
  input.$blockScrolling = Infinity;
  input.setOptions({
    useSoftTabs: true,
    tabSize: 2,
    maxLines: Infinity,
    mode: "ace/mode/gringo",
    autoScrollEditorIntoView: true
  });
  input.setOptions({
      readOnly: true,
      highlightActiveLine: false,
      highlightGutterLine: false
  });
  cur_line += input.session.doc.getAllLines().length;
}

//
