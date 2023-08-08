// This file is released under the MIT license.
// See LICENSE.md.

use_hidden_singles = true;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function until(conditionFunction) {
  const poll = resolve => {
    if(conditionFunction()) resolve();
    else setTimeout(_ => poll(resolve), 400);
  }
  return new Promise(poll);
}

async function wait_until_allowed_to_continue() {
  await until(_ => can_resume == true);
}

function deep_copy(object) {
  return JSON.parse(JSON.stringify(object));
}

function get_cell_no_from_coord(i, j) {
  return 9*i + j;
}

function check_full_board(board) {
  for (const cell of board) {
    if (cell.val == null) {
      return false;
    }
  }
  return true;
}

function check_conflict_board(board) {
  for (let i = 0; i < 9; i++) {
    for (let j1 = 0; j1 < 9; j1++) {
      for (let j2 = j1+1; j2 < 9; j2++) {
        c1 = get_cell_no_from_coord(i, j1);
        c2 = get_cell_no_from_coord(i, j2);
        if (board[c1].val != null &&
            board[c2].val != null &&
            board[c1].val == board[c2].val) {
          return true;
        }
      }
    }
  }
  for (let j = 0; j < 9; j++) {
    for (let i1 = 0; i1 < 9; i1++) {
      for (let i2 = i1+1; i2 < 9; i2++) {
        c1 = get_cell_no_from_coord(i1, j);
        c2 = get_cell_no_from_coord(i2, j);
        if (board[c1].val != null &&
            board[c2].val != null &&
            board[c1].val == board[c2].val) {
          return true;
        }
      }
    }
  }
  for (let bi = 0; bi < 3; bi++) {
    for (let bj = 0; bj < 3; bj++) {
      for (let li1 = 0; li1 < 3; li1++) {
        for (let lj1 = 0; lj1 < 3; lj1++) {
          for (let li2 = 0; li2 < 3; li2++) {
            for (let lj2 = 0; lj2 < 3; lj2++) {
              if (li1 != li2 || lj1 != lj2) {
                c1 = get_cell_no_from_coord(3*bi+li1, 3*bj+lj1);
                c2 = get_cell_no_from_coord(3*bi+li2, 3*bj+lj2);
                if (c1 < c2) {
                  if (board[c1].val != null &&
                      board[c2].val != null &&
                      board[c1].val == board[c2].val) {
                    return true;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return false;
}

function propagate_cells(board, c1, c2) {
  var has_changed = propagate_cells_asym(board, c1, c2);
  has_changed |= propagate_cells_asym(board, c2, c1);
  return has_changed;
}

function propagate_cells_asym(board, c1, c2) {
  var has_changed = false;
  if (board[c1].val != null && board[c2].val == null) {
    var index = board[c2].candidates.indexOf(parseInt(board[c1].val));
    if (index > -1) {
      has_changed = true;
      board[c2].candidates.splice(index, 1);
    }
  }
  return has_changed;
}

function propagate_eliminate_candidates_board(board) {
  var has_changed = false;

  for (let i = 0; i < 9; i++) {
    for (let j1 = 0; j1 < 9; j1++) {
      for (let j2 = j1+1; j2 < 9; j2++) {
        c1 = get_cell_no_from_coord(i, j1);
        c2 = get_cell_no_from_coord(i, j2);
        has_changed |= propagate_cells(board, c1, c2);
      }
    }
  }
  for (let j = 0; j < 9; j++) {
    for (let i1 = 0; i1 < 9; i1++) {
      for (let i2 = i1+1; i2 < 9; i2++) {
        c1 = get_cell_no_from_coord(i1, j);
        c2 = get_cell_no_from_coord(i2, j);
        has_changed |= propagate_cells(board, c1, c2);
      }
    }
  }
  for (let bi = 0; bi < 3; bi++) {
    for (let bj = 0; bj < 3; bj++) {
      for (let li1 = 0; li1 < 3; li1++) {
        for (let lj1 = 0; lj1 < 3; lj1++) {
          for (let li2 = 0; li2 < 3; li2++) {
            for (let lj2 = 0; lj2 < 3; lj2++) {
              if (li1 != li2 || lj1 != lj2) {
                c1 = get_cell_no_from_coord(3*bi+li1, 3*bj+lj1);
                c2 = get_cell_no_from_coord(3*bi+li2, 3*bj+lj2);
                if (c1 < c2) {
                  has_changed |= propagate_cells(board, c1, c2);
                }
              }
            }
          }
        }
      }
    }
  }

  return has_changed;
}

function propagate_board(board) {
  var has_changed = false;

  has_changed |= propagate_eliminate_candidates_board(board);

  // Hidden singles
  if (use_hidden_singles()) {
    for (let v = 1; v <= 9; v++) {
      for (let i = 0; i < 9; i++) {
        var times_as_candidate = 0;
        var cell_where_last_seen = null;
        row_loop:
        for (let j = 0; j < 9; j++) {
          c = get_cell_no_from_coord(i, j);
          if (board[c].val == v) {
            break row_loop;
          } else if (board[c].val == null &&
                     board[c].candidates.includes(v)) {
            times_as_candidate += 1;
            cell_where_last_seen = c;
          }
        }
        if (times_as_candidate == 1) {
          board[cell_where_last_seen].val = v;
          board[cell_where_last_seen].candidates = null;
          has_changed = true;
        }
      }
      has_changed |= propagate_eliminate_candidates_board(board);

      for (let j = 0; j < 9; j++) {
        var times_as_candidate = 0;
        var cell_where_last_seen = null;
        col_loop:
        for (let i = 0; i < 9; i++) {
          c = get_cell_no_from_coord(i, j);
          if (board[c].val == v) {
            break col_loop;
          } else if (board[c].val == null &&
                     board[c].candidates.includes(v)) {
            times_as_candidate += 1;
            cell_where_last_seen = c;
          }
        }
        if (times_as_candidate == 1) {
          board[cell_where_last_seen].val = v;
          board[cell_where_last_seen].candidates = null;
          has_changed = true;
        }
      }
      has_changed |= propagate_eliminate_candidates_board(board);

      for (let bi = 0; bi < 3; bi++) {
        for (let bj = 0; bj < 3; bj++) {
          var times_as_candidate = 0;
          var cell_where_last_seen = null;
          block_loop:
          for (let li = 0; li < 3; li++) {
            for (let lj = 0; lj < 3; lj++) {
              c = get_cell_no_from_coord(3*bi+li, 3*bj+lj);
              if (board[c].val == v) {
                break block_loop;
              } else if (board[c].val == null &&
                         board[c].candidates.includes(v)) {
                times_as_candidate += 1;
                cell_where_last_seen = c;
              }
            }
          }
          if (times_as_candidate == 1) {
            board[cell_where_last_seen].val = v;
            board[cell_where_last_seen].candidates = null;
            has_changed = true;
          }
        }
      }
      has_changed |= propagate_eliminate_candidates_board(board);
    }
  }
  // Lone singles
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      c = get_cell_no_from_coord(i, j);
      if (board[c].val == null && board[c].candidates.length == 1) {
        has_changed = true;
        board[c].val = board[c].candidates[0];
        board[c].candidates = [];
      }
    }
  }
  has_changed |= propagate_eliminate_candidates_board(board);

  return has_changed;
}

function decide_board(board, agenda) {
  var cell_to_branch_on = null;
  branch_cell_finding:
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      c = get_cell_no_from_coord(i, j);
      if (board[c].val == null) {
        cell_to_branch_on = c;
        break branch_cell_finding;
      }
    }
  }

  for (let i = board[cell_to_branch_on].candidates.length-1; i >= 0; i--) {
    new_board = deep_copy(board);
    new_board[cell_to_branch_on] = {
      val: board[cell_to_branch_on].candidates[i],
      candidates: [],
    }
    agenda.push(new_board);
  }
}

async function solve() {
  console.log("Solving..");
  interface_before_start();
  interface_start();

  agenda = [board];
  while (agenda.length > 0) {

    current_board = agenda.pop();
    if (should_abort) {
      interface_finish();
      return
    }
    interface_new_board(current_board);
    await sleep(interface_wait_time_new_board());
    await wait_until_allowed_to_continue();

    if (check_full_board(current_board) &&
        !check_conflict_board(current_board)) {
      if (should_abort) {
        interface_finish();
        return
      }
      interface_model(current_board);
      await wait_until_allowed_to_continue();
    } else {

      // Propagate (until fixpoint)
      if (should_abort) {
        interface_finish();
        return
      }
      var do_more_propagation = true;
      while (do_more_propagation) {
        do_more_propagation = propagate_board(current_board);
      }
      if (should_abort) {
        interface_finish();
        return
      }
      interface_new_board(current_board);
      if (check_conflict_board(current_board)) {
        continue;
      }
      await sleep(interface_wait_time_propagate());
      await wait_until_allowed_to_continue();

      if (check_full_board(current_board) &&
          !check_conflict_board(current_board)) {
        if (should_abort) {
          interface_finish();
          return
        }
        interface_model(current_board);
        await wait_until_allowed_to_continue();
      } else {
        // Branch
        if (should_abort) {
          interface_finish();
          return
        }
        decide_board(current_board, agenda);
      }
    }
  }
  interface_finish();
}
