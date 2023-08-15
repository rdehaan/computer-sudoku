// This file is released under the MIT license.
// See LICENSE.md.

var list_of_pages = [
  // CHAPTER 1
  {
    id: "1a",
    chapter: 1,
    title: "Computers can solve hard Sudoku's really quickly",
    url: "1a.html",
  },
  {
    id: "1b",
    chapter: 1,
    title: "What will we explain?",
    url: "1b.html",
    // Link to ToC
  },
  {
    id: "1c",
    chapter: 1,
    title: "Let's use some examples",
    url: "1c.html",
    // Extremely hard 1,
    // rating of 99529 by one of the most widely used sudoku rating programs online (gsf's sudoku q1)
  },
  {
    id: "1d",
    chapter: 1,
    title: "A demonstration",
    url: "1d.html",
  },
  // CHAPTER 2
  {
    id: "2a",
    chapter: 2,
    title: "Trial and error is effective",
    url: "2a.html",
  },
  {
    id: "2b",
    chapter: 2,
    title: "Speed is not enough",
    url: "2b.html",
  },
  {
    id: "2c",
    chapter: 2,
    title: "Let's unpack the simple algorithm",
    url: "2c.html",
  },
  // CHAPTER 3
  {
    id: "3a",
    chapter: 3,
    title: "The architecture of a modern approach",
    url: "3a.html",
  },
  {
    id: "3b",
    chapter: 3,
    title: "A primer in propositional logic and SAT",
    url: "3b.html",
  },
  {
    id: "3c",
    chapter: 3,
    title: "SAT: try it yourself (1)",
    url: "3c.html",
  },
  {
    id: "3d",
    chapter: 3,
    title: "SAT: try it yourself (2)",
    url: "3d.html",
  },
  {
    id: "3e",
    chapter: 3,
    title: "SAT solving algorithms",
    url: "3e.html",
  },
  {
    id: "3f",
    chapter: 3,
    title: "Search illustrated",
    url: "3f.html",
  },
  // CHAPTER 4
  {
    id: "4a",
    chapter: 4,
    title: "Encoding Sudoku's using logic",
    url: "4a.html",
  },
  {
    id: "4b",
    chapter: 4,
    title: "Handing it off to a SAT solver (1)",
    url: "4b.html",
  },
  {
    id: "4c",
    chapter: 4,
    title: "Handing it off to a SAT solver (2)",
    url: "4c.html",
  },
  // CHAPTER 5
  {
    id: "5a",
    chapter: 5,
    title: "More logic!",
    url: "5a.html",
  },
  // ASP
  {
    id: "5b",
    chapter: 5,
    title: "More solving algorithms!",
    url: "5b.html",
  },
  {
    id: "5c",
    chapter: 5,
    title: "Encoding Sudoku's using logic programs",
    url: "5c.html",
  },
  {
    id: "5d",
    chapter: 5,
    title: "Let's put it to the test!",
    url: "5d.html",
  },
  // CHAPTER 6
  {
    id: "6a",
    chapter: 6,
    title: "Read more and play around",
    url: "6a.html",
    // https://dl.acm.org/doi/10.1145/3560469
  },
]

function insertTOC() {
  var chapter = 0;
  var html_string = "";
  html_string += "<a href='index.html'>Introduction</a>"
  for (let i = 0; i < list_of_pages.length; i++) {
    var page_obj = list_of_pages[i];
    if (page_obj.chapter > chapter) {
      chapter = page_obj.chapter;
      if (chapter == 1) {
        html_string += "<ol class='toc'><li><ol class='toc-chapter'>";
      } else {
        html_string += "</ol></li><li><ol class='toc-chapter'>";
      }
    }
    html_string += "<li><a href='" + page_obj.url + "'>"
    html_string += page_obj.title + "</a></li>"
  }
  html_string += "</ol></li></ol>";

  var outputElement = document.getElementById('toc');
  outputElement.innerHTML = html_string;
}

function insertNav(current_id) {
  var current_index = 0;
  var found_id = false;
  do {
    if (list_of_pages[current_index].id == current_id) {
      found_id = true;
    } else {
      current_index++;
    }
  } while (!found_id);
  var prev_index = (current_index > 0) ? prev_index = current_index-1 : null;
  var next_index = (current_index < list_of_pages.length-1) ? current_index + 1 : null;
  html_string = "<div class='trigger'>";
  if (prev_index != null) {
    html_string += "<a class='page-link' href='";
    html_string += list_of_pages[prev_index].url + "'>"
    html_string += "&lArr; Previous";
    // html_string += ": " + list_of_pages[prev_index].title;
    html_string += "</a>"
    html_string += "<span class='page-link'>|</span>"
  } else {
    html_string += "<a class='page-link' href='";
    html_string += "index.html" + "'>"
    html_string += "&lArr; Previous";
    // html_string += ": " + list_of_pages[prev_index].title;
    html_string += "</a>"
    html_string += "<span class='page-link'>|</span>"
  }
  html_string += "<span class='page-link'>"
  html_string += list_of_pages[current_index].id + ": ";
  html_string += list_of_pages[current_index].title + "</span>"
  if (next_index != null) {
    html_string += "<span class='page-link'>|</span>"
    html_string += "<a class='page-link' href='";
    html_string += list_of_pages[next_index].url + "'>"
    html_string += "Next";
    // html_string += ": " + list_of_pages[prev_index].title
    html_string += " &rArr;</a>"
  }

  var headerNavElement = document.getElementById('header-nav');
  var footerNavElement = document.getElementById('footer-nav');
  headerNavElement.innerHTML = html_string;
  footerNavElement.innerHTML = html_string;
}
