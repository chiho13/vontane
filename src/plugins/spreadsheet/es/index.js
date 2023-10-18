import * as React from "react";
import classNames from "classnames";
import FormulaParser, { DepParser, FormulaError } from "fast-formula-parser";
import { createContext, useContextSelector } from "use-context-selector";

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function (d, b) {
  extendStatics =
    Object.setPrototypeOf ||
    ({ __proto__: [] } instanceof Array &&
      function (d, b) {
        d.__proto__ = b;
      }) ||
    function (d, b) {
      for (var p in b)
        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
    };
  return extendStatics(d, b);
};

function __extends(d, b) {
  if (typeof b !== "function" && b !== null)
    throw new TypeError(
      "Class extends value " + String(b) + " is not a constructor or null"
    );
  extendStatics(d, b);
  function __() {
    this.constructor = d;
  }
  d.prototype =
    b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
}

var __assign = function () {
  __assign =
    Object.assign ||
    function __assign(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s)
          if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
      return t;
    };
  return __assign.apply(this, arguments);
};

function __generator(thisArg, body) {
  var _ = {
      label: 0,
      sent: function () {
        if (t[0] & 1) throw t[1];
        return t[1];
      },
      trys: [],
      ops: [],
    },
    f,
    y,
    t,
    g;
  return (
    (g = { next: verb(0), throw: verb(1), return: verb(2) }),
    typeof Symbol === "function" &&
      (g[Symbol.iterator] = function () {
        return this;
      }),
    g
  );
  function verb(n) {
    return function (v) {
      return step([n, v]);
    };
  }
  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");
    while ((g && ((g = 0), op[0] && (_ = 0)), _))
      try {
        if (
          ((f = 1),
          y &&
            (t =
              op[0] & 2
                ? y["return"]
                : op[0]
                ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                : y.next) &&
            !(t = t.call(y, op[1])).done)
        )
          return t;
        if (((y = 0), t)) op = [op[0] & 2, t.value];
        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;
          case 4:
            _.label++;
            return { value: op[1], done: false };
          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;
          case 7:
            op = _.ops.pop();
            _.trys.pop();
            continue;
          default:
            if (
              !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
              (op[0] === 6 || op[0] === 2)
            ) {
              _ = 0;
              continue;
            }
            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
              _.label = op[1];
              break;
            }
            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }
            if (t && _.label < t[2]) {
              _.label = t[2];
              _.ops.push(op);
              break;
            }
            if (t[2]) _.ops.pop();
            _.trys.pop();
            continue;
        }
        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
    if (op[0] & 5) throw op[1];
    return { value: op[0] ? op[1] : void 0, done: true };
  }
}

function __values(o) {
  var s = typeof Symbol === "function" && Symbol.iterator,
    m = s && o[s],
    i = 0;
  if (m) return m.call(o);
  if (o && typeof o.length === "number")
    return {
      next: function () {
        if (o && i >= o.length) o = void 0;
        return { value: o && o[i++], done: !o };
      },
    };
  throw new TypeError(
    s ? "Object is not iterable." : "Symbol.iterator is not defined."
  );
}

function __read(o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m) return o;
  var i = m.call(o),
    r,
    ar = [],
    e;
  try {
    while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
  } catch (error) {
    e = { error: error };
  } finally {
    try {
      if (r && !r.done && (m = i["return"])) m.call(i);
    } finally {
      if (e) throw e.error;
    }
  }
  return ar;
}

function __spreadArray(to, from, pack) {
  if (pack || arguments.length === 2)
    for (var i = 0, l = from.length, ar; i < l; i++) {
      if (ar || !(i in from)) {
        if (!ar) ar = Array.prototype.slice.call(from, 0, i);
        ar[i] = from[i];
      }
    }
  return to.concat(ar || Array.prototype.slice.call(from));
}

var SET_DATA = "SET_DATA";
var SET_CREATE_FORMULA_PARSER = "SET_CREATE_FORMULA_PARSER";
var SELECT_ENTIRE_ROW = "SELECT_ENTIRE_ROW";
var SELECT_ENTIRE_COLUMN = "SELECT_ENTIRE_COLUMN";
var SELECT_ENTIRE_WORKSHEET = "SELECT_ENTIRE_WORKSHEET";
var SET_SELECTION = "SET_SELECTION";
var SELECT = "SELECT";
var ACTIVATE = "ACTIVATE";
var SET_CELL_DATA = "SET_CELL_DATA";
var SET_CELL_DIMENSIONS = "SET_CELL_DIMENSIONS";
var COPY = "COPY";
var CUT = "CUT";
var PASTE = "PASTE";
var EDIT = "EDIT";
var VIEW = "VIEW";
var CLEAR = "CLEAR";
var BLUR = "BLUR";
var KEY_PRESS = "KEY_PRESS";
var KEY_DOWN = "KEY_DOWN";
var DRAG_START = "DRAG_START";
var DRAG_END = "DRAG_END";
var COMMIT = "COMMIT";
function setData(data) {
  return {
    type: SET_DATA,
    payload: { data: data },
  };
}
function setCreateFormulaParser(createFormulaParser) {
  return {
    type: SET_CREATE_FORMULA_PARSER,
    payload: { createFormulaParser: createFormulaParser },
  };
}
function selectEntireRow(row, extend) {
  return {
    type: SELECT_ENTIRE_ROW,
    payload: { row: row, extend: extend },
  };
}
function selectEntireColumn(column, extend) {
  return {
    type: SELECT_ENTIRE_COLUMN,
    payload: { column: column, extend: extend },
  };
}
function selectEntireWorksheet() {
  return { type: SELECT_ENTIRE_WORKSHEET };
}
function setSelection(selection) {
  return { type: SET_SELECTION, payload: { selection: selection } };
}
function select(point) {
  return {
    type: SELECT,
    payload: { point: point },
  };
}
function activate(point) {
  return {
    type: ACTIVATE,
    payload: { point: point },
  };
}
function setCellData(active, data) {
  return {
    type: SET_CELL_DATA,
    payload: { active: active, data: data },
  };
}
function setCellDimensions(point, dimensions) {
  return {
    type: SET_CELL_DIMENSIONS,
    payload: { point: point, dimensions: dimensions },
  };
}
function paste(data) {
  return {
    type: PASTE,
    payload: { data: data },
  };
}
function keyPress(event) {
  return {
    type: KEY_PRESS,
    payload: { event: event },
  };
}
function keyDown(event) {
  return {
    type: KEY_DOWN,
    payload: { event: event },
  };
}
function dragStart() {
  return { type: DRAG_START };
}
function dragEnd() {
  return { type: DRAG_END };
}
function commit$1(changes) {
  return {
    type: COMMIT,
    payload: { changes: changes },
  };
}
function copy() {
  return { type: COPY };
}
function cut() {
  return { type: CUT };
}
function edit$1() {
  return { type: EDIT };
}
function view$1() {
  return { type: VIEW };
}
function blur$1() {
  return { type: BLUR };
}

/**
 * Creates an empty matrix with given rows and columns
 * @param rows - integer, the amount of rows the matrix should have
 * @param columns - integer, the amount of columns the matrix should have
 * @returns an empty matrix with given rows and columns
 */
function createEmpty(rows, columns) {
  var matrix = Array(rows);
  for (var i = 0; i < rows; i++) {
    matrix[i] = Array(columns);
  }
  return matrix;
}
/** Gets the value at row and column of matrix. */
function get(point, matrix) {
  var columns = matrix[point.row];
  if (columns === undefined) {
    return undefined;
  }
  return columns[point.column];
}
/** Creates a slice of matrix from startPoint up to, but not including, endPoint. */
function slice(startPoint, endPoint, matrix) {
  var sliced = [];
  var columns = endPoint.column - startPoint.column;
  for (var row = startPoint.row; row <= endPoint.row; row++) {
    var slicedRow = row - startPoint.row;
    sliced[slicedRow] = sliced[slicedRow] || Array(columns);
    for (var column = startPoint.column; column <= endPoint.column; column++) {
      sliced[slicedRow][column - startPoint.column] = get(
        { row: row, column: column },
        matrix
      );
    }
  }
  return sliced;
}
/** Sets the value at row and column of matrix. If a row doesn't exist, it's created. */
function set(point, value, matrix) {
  var nextMatrix = __spreadArray([], __read(matrix), false);
  // Synchronize first row length
  var firstRow = matrix[0];
  var nextFirstRow = firstRow ? __spreadArray([], __read(firstRow), false) : [];
  if (nextFirstRow.length - 1 < point.column) {
    nextFirstRow[point.column] = undefined;
    nextMatrix[0] = nextFirstRow;
  }
  var nextRow = matrix[point.row]
    ? __spreadArray([], __read(matrix[point.row]), false)
    : [];
  nextRow[point.column] = value;
  nextMatrix[point.row] = nextRow;
  return nextMatrix;
}
/** Like Matrix.set() but mutates the matrix */
function mutableSet(point, value, matrix) {
  var firstRow = matrix[0];
  if (!firstRow) {
    firstRow = [];
    matrix[0] = firstRow;
  }
  if (!(point.row in matrix)) {
    matrix[point.row] = [];
  }
  // Synchronize first row length
  if (!(point.column in firstRow)) {
    firstRow[point.column] = undefined;
  }
  matrix[point.row][point.column] = value;
}
/** Removes the coordinate of matrix */
function unset(point, matrix) {
  if (!has(point, matrix)) {
    return matrix;
  }
  var nextMatrix = __spreadArray([], __read(matrix), false);
  var nextRow = __spreadArray([], __read(matrix[point.row]), false);
  // Avoid deleting to preserve first row length
  nextRow[point.column] = undefined;
  nextMatrix[point.row] = nextRow;
  return nextMatrix;
}
/** Creates an array of values by running each element in collection thru iteratee. */
function map(func, matrix) {
  var e_1, _a;
  var newMatrix = [];
  try {
    for (
      var _b = __values(entries(matrix)), _c = _b.next();
      !_c.done;
      _c = _b.next()
    ) {
      var _d = __read(_c.value, 2),
        point = _d[0],
        value = _d[1];
      mutableSet(point, func(value, point), newMatrix);
    }
  } catch (e_1_1) {
    e_1 = { error: e_1_1 };
  } finally {
    try {
      if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
    } finally {
      if (e_1) throw e_1.error;
    }
  }
  return newMatrix;
}
/** Create an iterator over the cells in the matrix */
function entries(matrix) {
  var _a, _b, _c, row, values, _d, _e, _f, column, value, point, e_2_1, e_3_1;
  var e_3, _g, e_2, _h;
  return __generator(this, function (_j) {
    switch (_j.label) {
      case 0:
        _j.trys.push([0, 11, 12, 13]);
        (_a = __values(matrix.entries())), (_b = _a.next());
        _j.label = 1;
      case 1:
        if (!!_b.done) return [3 /*break*/, 10];
        (_c = __read(_b.value, 2)), (row = _c[0]), (values = _c[1]);
        _j.label = 2;
      case 2:
        _j.trys.push([2, 7, 8, 9]);
        (_d = ((e_2 = void 0), __values(values.entries()))), (_e = _d.next());
        _j.label = 3;
      case 3:
        if (!!_e.done) return [3 /*break*/, 6];
        (_f = __read(_e.value, 2)), (column = _f[0]), (value = _f[1]);
        point = { row: row, column: column };
        return [4 /*yield*/, [point, value]];
      case 4:
        _j.sent();
        _j.label = 5;
      case 5:
        _e = _d.next();
        return [3 /*break*/, 3];
      case 6:
        return [3 /*break*/, 9];
      case 7:
        e_2_1 = _j.sent();
        e_2 = { error: e_2_1 };
        return [3 /*break*/, 9];
      case 8:
        try {
          if (_e && !_e.done && (_h = _d.return)) _h.call(_d);
        } finally {
          if (e_2) throw e_2.error;
        }
        return [7 /*endfinally*/];
      case 9:
        _b = _a.next();
        return [3 /*break*/, 1];
      case 10:
        return [3 /*break*/, 13];
      case 11:
        e_3_1 = _j.sent();
        e_3 = { error: e_3_1 };
        return [3 /*break*/, 13];
      case 12:
        try {
          if (_b && !_b.done && (_g = _a.return)) _g.call(_a);
        } finally {
          if (e_3) throw e_3.error;
        }
        return [7 /*endfinally*/];
      case 13:
        return [2 /*return*/];
    }
  });
}
/**
 * Converts all elements in row into a string separated by horizontalSeparator and each row string
 * to string separated by verticalSeparator
 */
function join(matrix, horizontalSeparator, verticalSeparator) {
  if (horizontalSeparator === void 0) {
    horizontalSeparator = "\t";
  }
  if (verticalSeparator === void 0) {
    verticalSeparator = "\n";
  }
  var joined = "";
  var _a = getSize(matrix),
    rows = _a.rows,
    columns = _a.columns;
  for (var row = 0; row < rows; row++) {
    if (row) {
      joined += verticalSeparator;
    }
    for (var column = 0; column < columns; column++) {
      if (column) {
        joined += horizontalSeparator;
      }
      if (matrix[row] && column in matrix[row]) {
        joined += String(matrix[row][column]);
      }
    }
  }
  return joined;
}
/**
 * Parses a CSV separated by a horizontalSeparator and verticalSeparator into a
 * Matrix using a transform function
 */
function split(csv, transform, horizontalSeparator, verticalSeparator) {
  if (horizontalSeparator === void 0) {
    horizontalSeparator = "\t";
  }
  if (verticalSeparator === void 0) {
    verticalSeparator = /\r\n|\n|\r/;
  }
  return csv.split(verticalSeparator).map(function (row) {
    return row.split(horizontalSeparator).map(transform);
  });
}
/** Returns whether the point exists in the matrix or not. */
function has(point, matrix) {
  var firstRow = matrix[0];
  return (
    firstRow &&
    // validation
    point.row >= 0 &&
    point.column >= 0 &&
    Number.isInteger(point.row) &&
    Number.isInteger(point.column) &&
    // first row length is in sync with other rows
    point.column < firstRow.length &&
    point.row < matrix.length
  );
}
/** Gets the count of rows and columns of given matrix */
function getSize(matrix) {
  return {
    columns: getColumnsCount(matrix),
    rows: getRowsCount(matrix),
  };
}
/** Gets the count of rows of given matrix */
function getRowsCount(matrix) {
  return matrix.length;
}
/** Gets the count of columns of given matrix */
function getColumnsCount(matrix) {
  var firstRow = matrix[0];
  return firstRow ? firstRow.length : 0;
}
/**
 * Pads matrix with empty columns to match given total columns
 * @param matrix - matrix to pad
 * @param size - minimum size of the matrix after padding.
 * @returns the updated matrix
 */
function pad(matrix, size) {
  var _a = getSize(matrix),
    rows = _a.rows,
    columns = _a.columns;
  if (rows >= size.rows && columns >= size.columns) {
    // Optimization, no padding required.
    return matrix;
  }
  var resultSize = {
    rows: size.rows > rows ? size.rows : rows,
    columns: size.columns > columns ? size.columns : columns,
  };
  var padded = __spreadArray([], __read(matrix), false);
  if (resultSize.columns > columns) {
    var padColumns_1 = resultSize.columns - columns;
    padded = padded.map(function (row) {
      return __spreadArray(
        __spreadArray([], __read(row), false),
        __read(Array(padColumns_1).fill(undefined)),
        false
      );
    });
  }
  if (resultSize.rows > rows) {
    var padRows_1 = resultSize.rows - rows;
    var emptyRow = Array(resultSize.columns).fill(undefined);
    padded = __spreadArray(
      __spreadArray([], __read(padded), false),
      __read(Array(padRows_1).fill(emptyRow)),
      false
    );
  }
  return padded;
}
/**
 * Flattens a matrix values to an array
 * @param matrix - the matrix to flatten values from
 * @param transform - optional transform function to apply to each value in the
 * matrix
 * @returns an array of the values from matrix, transformed if a transform
 * function is passed
 */

function toArray(matrix, transform) {
  var array = [];
  for (var row = 0; row < matrix.length; row++) {
    for (var column = 0; column < matrix[row].length; column++) {
      var value = matrix[row][column];
      array.push(
        transform ? transform(value, { row: row, column: column }) : value
      );
    }
  }
  return array;
}
/** Returns the maximum point in the matrix */
function maxPoint(matrix) {
  var size = getSize(matrix);
  return { row: size.rows - 1, column: size.columns - 1 };
}

/**
 * Interface for ranges between two points
 */
/** Range between two points. Creates a normalized range between two given points */
var PointRange = /** @class */ (function () {
  function PointRange(source, target) {
    this.start = {
      row: Math.min(source.row, target.row),
      column: Math.min(source.column, target.column),
    };
    this.end = {
      row: Math.max(source.row, target.row),
      column: Math.max(source.column, target.column),
    };
  }
  /** Iterates through all the existing points in given range */
  PointRange.prototype[Symbol.iterator] = function () {
    var row, column;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          row = this.start.row;
          _a.label = 1;
        case 1:
          if (!(row <= this.end.row)) return [3 /*break*/, 6];
          column = this.start.column;
          _a.label = 2;
        case 2:
          if (!(column <= this.end.column)) return [3 /*break*/, 5];
          return [4 /*yield*/, { row: row, column: column }];
        case 3:
          _a.sent();
          _a.label = 4;
        case 4:
          column++;
          return [3 /*break*/, 2];
        case 5:
          row++;
          return [3 /*break*/, 1];
        case 6:
          return [2 /*return*/];
      }
    });
  };
  /** Returns the size (rows x columns) of the given range */
  PointRange.prototype.size = function () {
    var rows = this.end.row + 1 - this.start.row;
    var columns = this.end.column + 1 - this.start.column;
    return rows * columns;
  };
  /** Returns whether given point exists in given range */
  PointRange.prototype.has = function (point) {
    return (
      point.row >= this.start.row &&
      point.column >= this.start.column &&
      point.row <= this.end.row &&
      point.column <= this.end.column
    );
  };
  /** Limits given masked range with given mask */
  PointRange.prototype.mask = function (mask) {
    return new PointRange(
      {
        row: mask.start.row > this.start.row ? mask.start.row : this.start.row,
        column:
          mask.start.column > this.start.column
            ? mask.start.column
            : this.start.column,
      },
      {
        row: mask.end.row < this.end.row ? mask.end.row : this.end.row,
        column:
          mask.end.column < this.end.column ? mask.end.column : this.end.column,
      }
    );
  };
  /** Returns whether given range is equal to this range */
  PointRange.prototype.equals = function (range) {
    return (
      this.start.row === range.start.row &&
      this.start.column === range.start.column &&
      this.end.row === range.end.row &&
      this.end.column === range.end.column
    );
  };
  return PointRange;
})();

/** Return whether two given points are the equal */
function isEqual(source, target) {
  return source.column === target.column && source.row === target.row;
}
/** The origin point in matrices */
var ORIGIN = { row: 0, column: 0 };

/** Selection from a spreadsheet */
var Selection = /** @class */ (function () {
  function Selection() {}
  return Selection;
})();
/** Selection of no cells */
var EmptySelection = /** @class */ (function (_super) {
  __extends(EmptySelection, _super);
  function EmptySelection() {
    return (_super !== null && _super.apply(this, arguments)) || this;
  }
  EmptySelection.prototype.toRange = function (data) {
    return null;
  };
  EmptySelection.prototype.normalizeTo = function (data) {
    return this;
  };
  EmptySelection.prototype.hasEntireRow = function (row) {
    return false;
  };
  EmptySelection.prototype.hasEntireColumn = function (column) {
    return false;
  };
  EmptySelection.prototype.size = function () {
    return 0;
  };
  EmptySelection.prototype.has = function () {
    return false;
  };
  EmptySelection.prototype.equals = function (selection) {
    return selection instanceof EmptySelection;
  };
  return EmptySelection;
})(Selection);
/** Selection of a range of cells */
var RangeSelection = /** @class */ (function (_super) {
  __extends(RangeSelection, _super);
  function RangeSelection(range) {
    var _this = _super.call(this) || this;
    _this.range = range;
    return _this;
  }
  RangeSelection.prototype.toRange = function (data) {
    return this.range;
  };
  RangeSelection.prototype.normalizeTo = function (data) {
    var dataRange = getMatrixRange(data);
    var nextSelection = new RangeSelection(this.range.mask(dataRange));
    // @ts-expect-error
    return nextSelection;
  };
  RangeSelection.prototype.hasEntireRow = function (row) {
    return false;
  };
  RangeSelection.prototype.hasEntireColumn = function (column) {
    return false;
  };
  RangeSelection.prototype.size = function (data) {
    var range = this.toRange(data);
    return range ? range.size() : 0;
  };
  RangeSelection.prototype.has = function (data, point) {
    var range = this.toRange(data);
    return range !== null && range.has(point);
  };
  RangeSelection.prototype.equals = function (selection) {
    return (
      selection instanceof RangeSelection && this.range.equals(selection.range)
    );
  };
  return RangeSelection;
})(Selection);
/** Selection of an entire part of the spreadsheet */
var EntireSelection = /** @class */ (function (_super) {
  __extends(EntireSelection, _super);
  function EntireSelection() {
    return (_super !== null && _super.apply(this, arguments)) || this;
  }
  return EntireSelection;
})(Selection);
/** Selection of the entire worksheet */
var EntireWorksheetSelection = /** @class */ (function (_super) {
  __extends(EntireWorksheetSelection, _super);
  function EntireWorksheetSelection() {
    return (_super !== null && _super.apply(this, arguments)) || this;
  }
  EntireWorksheetSelection.prototype.toRange = function (data) {
    return getMatrixRange(data);
  };
  EntireWorksheetSelection.prototype.normalizeTo = function (data) {
    return this;
  };
  EntireWorksheetSelection.prototype.hasEntireColumn = function (column) {
    return true;
  };
  EntireWorksheetSelection.prototype.hasEntireRow = function (row) {
    return true;
  };
  EntireWorksheetSelection.prototype.size = function (data) {
    return getColumnsCount(data) * getRowsCount(data);
  };
  EntireWorksheetSelection.prototype.has = function (data, point) {
    return true;
  };
  EntireWorksheetSelection.prototype.equals = function (selection) {
    return selection instanceof EntireWorksheetSelection;
  };
  return EntireWorksheetSelection;
})(EntireSelection);
/** Selection of an entire axis in the spreadsheet */
var EntireAxisSelection = /** @class */ (function (_super) {
  __extends(EntireAxisSelection, _super);
  /**
   * @param start - row index where the selection starts, integer
   * @param end - row index where the selection ends, integer
   * @throws {@link InvalidIndexError}
   */
  function EntireAxisSelection(start, end) {
    var _this = this;
    if (!isIndex(start)) {
      throw new InvalidIndexError("start");
    }
    if (!isIndex(end)) {
      throw new InvalidIndexError("end");
    }
    _this = _super.call(this) || this;
    _this.start = Math.min(start, end);
    _this.end = Math.max(start, end);
    return _this;
  }
  EntireAxisSelection.prototype.equals = function (selection) {
    return (
      selection instanceof EntireAxisSelection &&
      this.constructor === selection.constructor &&
      this.start === selection.start &&
      this.end === selection.end
    );
  };
  return EntireAxisSelection;
})(EntireSelection);
/** Selection of entire rows in the spreadsheet */
var EntireRowsSelection = /** @class */ (function (_super) {
  __extends(EntireRowsSelection, _super);
  function EntireRowsSelection() {
    return (_super !== null && _super.apply(this, arguments)) || this;
  }
  EntireRowsSelection.prototype.toRange = function (data) {
    var max = maxPoint(data);
    return new PointRange(
      { row: this.start, column: 0 },
      { row: this.end, column: max.column }
    );
  };
  EntireRowsSelection.prototype.normalizeTo = function (data) {
    var count = getRowsCount(data);
    var nextSelection = new EntireRowsSelection(
      Math.max(this.start, 0),
      Math.min(this.end, count - 1)
    );
    // @ts-expect-error
    return nextSelection;
  };
  EntireRowsSelection.prototype.hasEntireRow = function (row) {
    return row >= this.start && row <= this.end;
  };
  EntireRowsSelection.prototype.hasEntireColumn = function (column) {
    return false;
  };
  EntireRowsSelection.prototype.size = function (data) {
    var rows = this.end - this.start + 1;
    return rows * getColumnsCount(data);
  };
  EntireRowsSelection.prototype.has = function (data, point) {
    return point.row >= this.start && point.row <= this.end;
  };
  return EntireRowsSelection;
})(EntireAxisSelection);
/** Selection of entire columns in the spreadsheet */
var EntireColumnsSelection = /** @class */ (function (_super) {
  __extends(EntireColumnsSelection, _super);
  function EntireColumnsSelection() {
    return (_super !== null && _super.apply(this, arguments)) || this;
  }
  EntireColumnsSelection.prototype.toRange = function (data) {
    var max = maxPoint(data);
    return new PointRange(
      { row: 0, column: this.start },
      { row: max.row, column: this.end }
    );
  };
  EntireColumnsSelection.prototype.normalizeTo = function (data) {
    var count = getColumnsCount(data);
    var nextSelection = new EntireColumnsSelection(
      Math.max(this.start, 0),
      Math.min(this.end, count - 1)
    );
    // @ts-expect-error
    return nextSelection;
  };
  EntireColumnsSelection.prototype.hasEntireRow = function (row) {
    return false;
  };
  EntireColumnsSelection.prototype.hasEntireColumn = function (column) {
    return column >= this.start && column <= this.end;
  };
  EntireColumnsSelection.prototype.size = function (data) {
    var columns = this.end - this.start + 1;
    return columns * getRowsCount(data);
  };
  EntireColumnsSelection.prototype.has = function (data, point) {
    return point.column >= this.start && point.column <= this.end;
  };
  return EntireColumnsSelection;
})(EntireAxisSelection);
/** Get the point range of given matrix */
function getMatrixRange(data) {
  var maxPoint$1 = maxPoint(data);
  return new PointRange(ORIGIN, maxPoint$1);
}
/** Determines whether the given value is a valid index */
function isIndex(value) {
  return Number.isInteger(value) && value >= 0;
}
/** Error thrown when passing a non-index value where an index value is expected */
var InvalidIndexError = /** @class */ (function (_super) {
  __extends(InvalidIndexError, _super);
  function InvalidIndexError(name) {
    return (
      _super.call(
        this,
        "".concat(
          name,
          " is not a valid index. It must be 0 or a positive integer"
        )
      ) || this
    );
  }
  return InvalidIndexError;
})(Error);

var PLAIN_TEXT_MIME = "text/plain";
var FOCUS_WITHIN_SELECTOR = ":focus-within";
/** Move the cursor of given input element to the input's end */
function moveCursorToEnd(el) {
  el.selectionStart = el.selectionEnd = el.value.length;
}
/**
 * Creates an array of numbers (positive and/or negative) progressing from start up to, but not including, end. A step of -1 is used if a negative start is specified without an end or step. If end is not specified, it's set to start with start then set to 0.
 * @param end - an integer number specifying at which position to stop (not included).
 * @param start - An integer number specifying at which position to start.
 * @param step - An integer number specifying the incrementation
 */
function range(end, start, step) {
  if (start === void 0) {
    start = 0;
  }
  if (step === void 0) {
    step = 1;
  }
  var array = [];
  if (Math.sign(end - start) === -1) {
    for (var element = start; element > end; element -= step) {
      array.push(element);
    }
    return array;
  }
  for (var element = start; element < end; element += step) {
    array.push(element);
  }
  return array;
}
/** Return whether given point is active */
function isActive(active, point) {
  return Boolean(active && isEqual(point, active));
}
/** Get the offset values of given element */
function getOffsetRect(element) {
  return {
    width: element.offsetWidth,
    height: element.offsetHeight,
    left: element.offsetLeft,
    top: element.offsetTop,
  };
}
/** Write given data to clipboard with given event */
function writeTextToClipboard(event, data) {
  var _a;
  (_a = event.clipboardData) === null || _a === void 0
    ? void 0
    : _a.setData(PLAIN_TEXT_MIME, data);
}
/** Read text from given clipboard event */
function readTextFromClipboard(event) {
  // @ts-ignore
  if (window.clipboardData && window.clipboardData.getData) {
    // @ts-ignore
    return window.clipboardData.getData("Text");
  }
  if (event.clipboardData && event.clipboardData.getData) {
    return event.clipboardData.getData(PLAIN_TEXT_MIME);
  }
  return "";
}
/** Get the dimensions of cell at point from state */
function getCellDimensions(point, rowDimensions, columnDimensions) {
  var cellRowDimensions = rowDimensions && rowDimensions[point.row];
  var cellColumnDimensions = columnDimensions && columnDimensions[point.column];
  return (
    cellRowDimensions &&
    cellColumnDimensions &&
    __assign(__assign({}, cellRowDimensions), cellColumnDimensions)
  );
}
/** Get the dimensions of a range of cells */
function getRangeDimensions(rowDimensions, columnDimensions, range) {
  var startDimensions = getCellDimensions(
    range.start,
    rowDimensions,
    columnDimensions
  );
  var endDimensions = getCellDimensions(
    range.end,
    rowDimensions,
    columnDimensions
  );
  return (
    startDimensions &&
    endDimensions && {
      width: endDimensions.left + endDimensions.width - startDimensions.left,
      height: endDimensions.top + endDimensions.height - startDimensions.top,
      top: startDimensions.top,
      left: startDimensions.left,
    }
  );
}
/** Get the dimensions of selected */
function getSelectedDimensions(
  rowDimensions,
  columnDimensions,
  data,
  selected
) {
  var range = selected.toRange(data);
  return range
    ? getRangeDimensions(rowDimensions, columnDimensions, range)
    : undefined;
}
/** Get given data as CSV */
function getCSV(data) {
  var valueMatrix = map(function (cell) {
    return (cell === null || cell === void 0 ? void 0 : cell.value) || "";
  }, data);
  return join(valueMatrix);
}
/**
 * Calculate the rows and columns counts of a spreadsheet
 * @param data - the spreadsheet's data
 * @param rowLabels - the spreadsheet's row labels (if defined)
 * @param columnLabels - the spreadsheet's column labels (if defined)
 * @returns the rows and columns counts of a spreadsheet
 */
function calculateSpreadsheetSize(data, rowLabels, columnLabels) {
  var _a = getSize(data),
    columns = _a.columns,
    rows = _a.rows;
  return {
    rows: rowLabels ? Math.max(rows, rowLabels.length) : rows,
    columns: columnLabels ? Math.max(columns, columnLabels.length) : columns,
  };
}
/** Should spreadsheet handle clipboard event */
function shouldHandleClipboardEvent(root, mode) {
  return root !== null && mode === "view" && isFocusedWithin(root);
}
function isFocusedWithin(element) {
  return element.matches(FOCUS_WITHIN_SELECTOR);
}

function toString(point) {
  return "".concat(point.row, ",").concat(point.column);
}
function fromString(point) {
  var _a = __read(point.split(","), 2),
    row = _a[0],
    column = _a[1];
  return { row: Number(row), column: Number(column) };
}

/**
 * Immutable Set like interface of points
 */
var PointSet = /** @class */ (function () {
  function PointSet(set) {
    this.set = set;
  }
  /** Creates a new PointSet instance from an array-like or iterable object */
  PointSet.from = function (points) {
    var e_1, _a;
    var set = new Set();
    try {
      for (
        var points_1 = __values(points), points_1_1 = points_1.next();
        !points_1_1.done;
        points_1_1 = points_1.next()
      ) {
        var point = points_1_1.value;
        set.add(toString(point));
      }
    } catch (e_1_1) {
      e_1 = { error: e_1_1 };
    } finally {
      try {
        if (points_1_1 && !points_1_1.done && (_a = points_1.return))
          _a.call(points_1);
      } finally {
        if (e_1) throw e_1.error;
      }
    }
    return new PointSet(set);
  };
  /** Returns a boolean asserting whether an point is present with the given value in the Set object or not */
  PointSet.prototype.has = function (point) {
    return this.set.has(toString(point));
  };
  Object.defineProperty(PointSet.prototype, "size", {
    /** Returns the number of points in a PointSet object */
    get: function () {
      return this.set.size;
    },
    enumerable: false,
    configurable: true,
  });
  /** Add the given point to given set */
  PointSet.prototype.add = function (point) {
    var newSet = new Set(this.set);
    newSet.add(toString(point));
    return new PointSet(newSet);
  };
  /** Remove the given point from the given set */
  PointSet.prototype.delete = function (point) {
    var newSet = new Set(this.set);
    if (!newSet.delete(toString(point))) {
      return this;
    }
    return new PointSet(newSet);
  };
  /** Returns a new PointSet with points common to the set and other */
  PointSet.prototype.difference = function (other) {
    var e_2, _a;
    var newSet = this;
    try {
      for (
        var other_1 = __values(other), other_1_1 = other_1.next();
        !other_1_1.done;
        other_1_1 = other_1.next()
      ) {
        var point = other_1_1.value;
        newSet = newSet.delete(point);
      }
    } catch (e_2_1) {
      e_2 = { error: e_2_1 };
    } finally {
      try {
        if (other_1_1 && !other_1_1.done && (_a = other_1.return))
          _a.call(other_1);
      } finally {
        if (e_2) throw e_2.error;
      }
    }
    return newSet;
  };
  /** Returns a new PointSet with all points in both sets */
  PointSet.prototype.union = function (other) {
    var e_3, _a;
    var newSet = this;
    try {
      for (
        var other_2 = __values(other), other_2_1 = other_2.next();
        !other_2_1.done;
        other_2_1 = other_2.next()
      ) {
        var point = other_2_1.value;
        newSet = newSet.add(point);
      }
    } catch (e_3_1) {
      e_3 = { error: e_3_1 };
    } finally {
      try {
        if (other_2_1 && !other_2_1.done && (_a = other_2.return))
          _a.call(other_2);
      } finally {
        if (e_3) throw e_3.error;
      }
    }
    return newSet;
  };
  /** Creates an iterator of points in the set */
  PointSet.prototype[Symbol.iterator] = function () {
    var _a, _b, value, e_4_1;
    var e_4, _c;
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 5, 6, 7]);
          (_a = __values(this.set)), (_b = _a.next());
          _d.label = 1;
        case 1:
          if (!!_b.done) return [3 /*break*/, 4];
          value = _b.value;
          return [4 /*yield*/, fromString(value)];
        case 2:
          _d.sent();
          _d.label = 3;
        case 3:
          _b = _a.next();
          return [3 /*break*/, 1];
        case 4:
          return [3 /*break*/, 7];
        case 5:
          e_4_1 = _d.sent();
          e_4 = { error: e_4_1 };
          return [3 /*break*/, 7];
        case 6:
          try {
            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
          } finally {
            if (e_4) throw e_4.error;
          }
          return [7 /*endfinally*/];
        case 7:
          return [2 /*return*/];
      }
    });
  };
  return PointSet;
})();

var FORMULA_VALUE_PREFIX = "=";
/** Returns whether given value is a formula */
function isFormulaValue(value) {
  return (
    typeof value === "string" &&
    value.startsWith(FORMULA_VALUE_PREFIX) &&
    value.length > 1
  );
}
/** Extracts formula from value  */
function extractFormula(value) {
  return value.slice(1);
}
function createFormulaParser(data, config) {
  return new FormulaParser(
    __assign(__assign({}, config), {
      onCell: function (ref) {
        var point = {
          row: ref.row - 1,
          column: ref.col - 1,
        };
        var cell = get(point, data);
        if (!isNaN(cell === null || cell === void 0 ? void 0 : cell.value))
          return Number(cell === null || cell === void 0 ? void 0 : cell.value);
        return cell === null || cell === void 0 ? void 0 : cell.value;
      },
      onRange: function (ref) {
        var size = getSize(data);
        var start = {
          row: ref.from.row - 1,
          column: ref.from.col - 1,
        };
        var end = {
          row: Math.min(ref.to.row - 1, size.rows - 1),
          column: Math.min(ref.to.col - 1, size.columns - 1),
        };
        var dataSlice = slice(start, end, data);
        return toArray(dataSlice, function (cell) {
          if (!isNaN(cell === null || cell === void 0 ? void 0 : cell.value))
            return Number(
              cell === null || cell === void 0 ? void 0 : cell.value
            );
          return cell === null || cell === void 0 ? void 0 : cell.value;
        });
      },
    })
  );
}
var depParser = new DepParser();
/**
 * For given formula returns the cell references
 * @param formula - formula to get references for
 */
function getReferences(formula, point, data) {
  var _a = getSize(data),
    rows = _a.rows,
    columns = _a.columns;
  try {
    var dependencies = depParser.parse(formula, convertPointToCellRef(point));
    var references = PointSet.from(
      dependencies.flatMap(function (reference) {
        var isRange = "from" in reference;
        if (isRange) {
          var from = reference.from,
            to = reference.to;
          var normalizedFrom = {
            row: from.row - 1,
            column: from.col - 1,
          };
          var normalizedTo = {
            row: Math.min(to.row - 1, rows - 1),
            column: Math.min(to.col - 1, columns - 1),
          };
          var range = new PointRange(normalizedFrom, normalizedTo);
          return Array.from(range);
        }
        return { row: reference.row - 1, column: reference.col - 1 };
      })
    );
    return references;
  } catch (error) {
    if (error instanceof FormulaError) {
      return PointSet.from([]);
    } else {
      throw error;
    }
  }
}
function evaluate(formula, point, formulaParser) {
  try {
    var position = convertPointToCellRef(point);
    var returned = formulaParser.parse(formula, position);
    return returned instanceof FormulaError ? returned.toString() : returned;
  } catch (error) {
    if (error instanceof FormulaError) {
      return error.toString();
    }
    throw error;
  }
}
function convertPointToCellRef(point) {
  return {
    row: point.row + 1,
    col: point.column + 1,
    // TODO: fill once we support multiple sheets
    sheet: "Sheet1",
  };
}

/**
 * Immutable directed graph of points, where each point can have multiple
 * edges to other points.
 */
var PointGraph = /** @class */ (function () {
  function PointGraph(forwards) {
    if (forwards === void 0) {
      forwards = new Map();
    }
    this.forwards = forwards;
  }
  /** Creates a new PointGraph instance from an array-like or iterable object */
  PointGraph.from = function (pairs) {
    var e_1, _a;
    var forwards = new Map();
    try {
      for (
        var pairs_1 = __values(pairs), pairs_1_1 = pairs_1.next();
        !pairs_1_1.done;
        pairs_1_1 = pairs_1.next()
      ) {
        var _b = __read(pairs_1_1.value, 2),
          node = _b[0],
          edges = _b[1];
        forwards.set(toString(node), edges);
      }
    } catch (e_1_1) {
      e_1 = { error: e_1_1 };
    } finally {
      try {
        if (pairs_1_1 && !pairs_1_1.done && (_a = pairs_1.return))
          _a.call(pairs_1);
      } finally {
        if (e_1) throw e_1.error;
      }
    }
    return new PointGraph(forwards);
  };
  PointGraph.prototype.set = function (node, edges) {
    var newGraph = new PointGraph(new Map(this.forwards));
    if (edges.size === 0) {
      newGraph.forwards.delete(toString(node));
      return newGraph;
    }
    newGraph.forwards.set(toString(node), edges);
    return newGraph;
  };
  PointGraph.prototype.get = function (node) {
    return this.forwards.get(toString(node)) || PointSet.from([]);
  };
  PointGraph.prototype.getBackwards = function (node) {
    var e_2, _a;
    var result = PointSet.from([]);
    try {
      for (
        var _b = __values(this.forwards), _c = _b.next();
        !_c.done;
        _c = _b.next()
      ) {
        var _d = __read(_c.value, 2),
          key = _d[0],
          value = _d[1];
        if (value.has(node)) {
          result = result.add(fromString(key));
        }
      }
    } catch (e_2_1) {
      e_2 = { error: e_2_1 };
    } finally {
      try {
        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
      } finally {
        if (e_2) throw e_2.error;
      }
    }
    return result;
  };
  PointGraph.prototype.getBackwardsRecursive = function (node, visited) {
    var e_3, _a;
    if (visited === void 0) {
      visited = PointSet.from([]);
    }
    var result = this.getBackwards(node);
    var newVisited = visited;
    try {
      for (
        var result_1 = __values(result), result_1_1 = result_1.next();
        !result_1_1.done;
        result_1_1 = result_1.next()
      ) {
        var point = result_1_1.value;
        if (newVisited.has(point)) {
          continue;
        }
        newVisited = newVisited.add(point);
        result = result.union(this.getBackwardsRecursive(point, newVisited));
      }
    } catch (e_3_1) {
      e_3 = { error: e_3_1 };
    } finally {
      try {
        if (result_1_1 && !result_1_1.done && (_a = result_1.return))
          _a.call(result_1);
      } finally {
        if (e_3) throw e_3.error;
      }
    }
    return result;
  };
  /** Determine whether the graph has a circular dependency, starting from given start point */
  PointGraph.prototype.hasCircularDependency = function (startPoint) {
    var e_4, _a;
    var visited = PointSet.from([]);
    var stack = [startPoint];
    while (stack.length > 0) {
      var current = stack.pop();
      if (!current) {
        continue;
      }
      if (visited.has(current)) {
        return true;
      }
      visited = visited.add(current);
      var dependents = this.get(current);
      if (!dependents) {
        continue;
      }
      try {
        for (
          var dependents_1 = ((e_4 = void 0), __values(dependents)),
            dependents_1_1 = dependents_1.next();
          !dependents_1_1.done;
          dependents_1_1 = dependents_1.next()
        ) {
          var dependent = dependents_1_1.value;
          stack.push(dependent);
        }
      } catch (e_4_1) {
        e_4 = { error: e_4_1 };
      } finally {
        try {
          if (
            dependents_1_1 &&
            !dependents_1_1.done &&
            (_a = dependents_1.return)
          )
            _a.call(dependents_1);
        } finally {
          if (e_4) throw e_4.error;
        }
      }
    }
    return false;
  };
  PointGraph.prototype[Symbol.iterator] = function () {
    var visitedHashes,
      _a,
      _b,
      _c,
      key,
      values,
      point,
      values_1,
      values_1_1,
      value,
      hash,
      e_5_1,
      e_6_1;
    var e_6, _d, e_5, _e;
    return __generator(this, function (_f) {
      switch (_f.label) {
        case 0:
          visitedHashes = new Set();
          _f.label = 1;
        case 1:
          _f.trys.push([1, 13, 14, 15]);
          (_a = __values(this.forwards)), (_b = _a.next());
          _f.label = 2;
        case 2:
          if (!!_b.done) return [3 /*break*/, 12];
          (_c = __read(_b.value, 2)), (key = _c[0]), (values = _c[1]);
          point = fromString(key);
          visitedHashes.add(key);
          return [4 /*yield*/, [point, values]];
        case 3:
          _f.sent();
          _f.label = 4;
        case 4:
          _f.trys.push([4, 9, 10, 11]);
          (values_1 = ((e_5 = void 0), __values(values))),
            (values_1_1 = values_1.next());
          _f.label = 5;
        case 5:
          if (!!values_1_1.done) return [3 /*break*/, 8];
          value = values_1_1.value;
          hash = toString(value);
          if (!(!visitedHashes.has(hash) && !this.forwards.has(hash)))
            return [3 /*break*/, 7];
          visitedHashes.add(hash);
          return [4 /*yield*/, [value, PointSet.from([])]];
        case 6:
          _f.sent();
          _f.label = 7;
        case 7:
          values_1_1 = values_1.next();
          return [3 /*break*/, 5];
        case 8:
          return [3 /*break*/, 11];
        case 9:
          e_5_1 = _f.sent();
          e_5 = { error: e_5_1 };
          return [3 /*break*/, 11];
        case 10:
          try {
            if (values_1_1 && !values_1_1.done && (_e = values_1.return))
              _e.call(values_1);
          } finally {
            if (e_5) throw e_5.error;
          }
          return [7 /*endfinally*/];
        case 11:
          _b = _a.next();
          return [3 /*break*/, 2];
        case 12:
          return [3 /*break*/, 15];
        case 13:
          e_6_1 = _f.sent();
          e_6 = { error: e_6_1 };
          return [3 /*break*/, 15];
        case 14:
          try {
            if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
          } finally {
            if (e_6) throw e_6.error;
          }
          return [7 /*endfinally*/];
        case 15:
          return [2 /*return*/];
      }
    });
  };
  /** Get the points in the graph in a breadth-first order */
  PointGraph.prototype.traverseBFSBackwards = function () {
    var visited,
      queue,
      _a,
      _b,
      _c,
      point,
      values,
      point,
      dependents,
      dependents_2,
      dependents_2_1,
      dependent;
    var e_7, _d, e_8, _e;
    return __generator(this, function (_f) {
      switch (_f.label) {
        case 0:
          visited = PointSet.from([]);
          queue = [];
          try {
            // Iterate over all the points and add the ones with no dependencies to the queue
            for (
              _a = __values(this), _b = _a.next();
              !_b.done;
              _b = _a.next()
            ) {
              (_c = __read(_b.value, 2)), (point = _c[0]), (values = _c[1]);
              if (values.size === 0) {
                visited = visited.add(point);
                queue.push(point);
              }
            }
          } catch (e_7_1) {
            e_7 = { error: e_7_1 };
          } finally {
            try {
              if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
            } finally {
              if (e_7) throw e_7.error;
            }
          }
          _f.label = 1;
        case 1:
          if (!(queue.length > 0)) return [3 /*break*/, 3];
          point = queue.shift();
          if (!point) {
            return [3 /*break*/, 1];
          }
          return [4 /*yield*/, point];
        case 2:
          _f.sent();
          dependents = this.getBackwards(point);
          // If there are no dependents, skip to the next iteration
          if (dependents.size === 0) {
            return [3 /*break*/, 1];
          }
          try {
            // Otherwise, add the dependents to the queue if they have not yet been visited
            for (
              dependents_2 = ((e_8 = void 0), __values(dependents)),
                dependents_2_1 = dependents_2.next();
              !dependents_2_1.done;
              dependents_2_1 = dependents_2.next()
            ) {
              dependent = dependents_2_1.value;
              if (
                !visited.has(dependent) &&
                this.get(dependent).difference(visited).size === 0
              ) {
                queue.push(dependent);
                visited = visited.add(dependent);
              }
            }
          } catch (e_8_1) {
            e_8 = { error: e_8_1 };
          } finally {
            try {
              if (
                dependents_2_1 &&
                !dependents_2_1.done &&
                (_e = dependents_2.return)
              )
                _e.call(dependents_2);
            } finally {
              if (e_8) throw e_8.error;
            }
          }
          return [3 /*break*/, 1];
        case 3:
          return [2 /*return*/];
      }
    });
  };
  return PointGraph;
})();

var Model = /** @class */ (function () {
  function Model(createFormulaParser, data, referenceGraph, evaluatedData) {
    this.createFormulaParser = createFormulaParser;
    this.data = data;
    this.referenceGraph = referenceGraph || createReferenceGraph(data);
    this.evaluatedData =
      evaluatedData ||
      createEvaluatedData(data, this.referenceGraph, this.createFormulaParser);
  }
  return Model;
})();
function updateCellValue(model, point, cell) {
  var nextData = set(point, cell, model.data);
  var nextReferenceGraph = isFormulaValue(cell.value)
    ? updateReferenceGraph(model.referenceGraph, point, cell, nextData)
    : model.referenceGraph;
  var formulaParser = model.createFormulaParser(nextData);
  var nextEvaluatedData = evaluateCell(
    model.evaluatedData,
    nextData,
    nextReferenceGraph,
    point,
    cell,
    formulaParser
  );
  return new Model(
    model.createFormulaParser,
    nextData,
    nextReferenceGraph,
    nextEvaluatedData
  );
}
function updateReferenceGraph(referenceGraph, point, cell, data) {
  var references = getReferences(extractFormula(cell.value), point, data);
  var nextReferenceGraph = referenceGraph.set(point, references);
  return nextReferenceGraph;
}
function evaluateCell(
  prevEvaluatedData,
  data,
  referenceGraph,
  point,
  cell,
  formulaParser
) {
  var e_1, _a, e_2, _b;
  if (referenceGraph.hasCircularDependency(point)) {
    var visited = PointSet.from([point]);
    var nextEvaluatedData_1 = set(
      point,
      __assign(__assign({}, cell), { value: FormulaError.REF }),
      prevEvaluatedData
    );
    try {
      for (
        var _c = __values(referenceGraph.getBackwardsRecursive(point)),
          _d = _c.next();
        !_d.done;
        _d = _c.next()
      ) {
        var referrer = _d.value;
        if (visited.has(referrer)) {
          break;
        }
        visited = visited.add(referrer);
        var referrerCell = get(referrer, data);
        if (!referrerCell) {
          continue;
        }
        nextEvaluatedData_1 = set(
          referrer,
          __assign(__assign({}, referrerCell), { value: FormulaError.REF }),
          nextEvaluatedData_1
        );
      }
    } catch (e_1_1) {
      e_1 = { error: e_1_1 };
    } finally {
      try {
        if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
      } finally {
        if (e_1) throw e_1.error;
      }
    }
    return nextEvaluatedData_1;
  }
  var nextEvaluatedData = prevEvaluatedData;
  var evaluatedValue = isFormulaValue(cell.value)
    ? getFormulaComputedValue(cell.value, point, formulaParser)
    : cell.value;
  var evaluatedCell = __assign(__assign({}, cell), { value: evaluatedValue });
  nextEvaluatedData = set(point, evaluatedCell, nextEvaluatedData);
  try {
    // for every formula cell that references the cell re-evaluate (recursive)
    for (
      var _e = __values(referenceGraph.getBackwardsRecursive(point)),
        _f = _e.next();
      !_f.done;
      _f = _e.next()
    ) {
      var referrer = _f.value;
      var referrerCell = get(referrer, data);
      if (!referrerCell) {
        continue;
      }
      var evaluatedValue_1 = isFormulaValue(referrerCell.value)
        ? getFormulaComputedValue(referrerCell.value, point, formulaParser)
        : referrerCell.value;
      var evaluatedCell_1 = __assign(__assign({}, referrerCell), {
        value: evaluatedValue_1,
      });
      nextEvaluatedData = set(referrer, evaluatedCell_1, nextEvaluatedData);
    }
  } catch (e_2_1) {
    e_2 = { error: e_2_1 };
  } finally {
    try {
      if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
    } finally {
      if (e_2) throw e_2.error;
    }
  }
  return nextEvaluatedData;
}
/**
 *
 * @param data - the spreadsheet data
 * @returns the spreadsheet reference graph
 */
function createReferenceGraph(data) {
  var e_3, _a;
  var entries$1 = [];
  try {
    for (
      var _b = __values(entries(data)), _c = _b.next();
      !_c.done;
      _c = _b.next()
    ) {
      var _d = __read(_c.value, 2),
        point = _d[0],
        cell = _d[1];
      if (cell && isFormulaValue(cell.value)) {
        var references = getReferences(extractFormula(cell.value), point, data);
        entries$1.push([point, references]);
      }
    }
  } catch (e_3_1) {
    e_3 = { error: e_3_1 };
  } finally {
    try {
      if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
    } finally {
      if (e_3) throw e_3.error;
    }
  }
  return PointGraph.from(entries$1);
}
function createEvaluatedData(data, referenceGraph, createFormulaParser) {
  var e_4, _a;
  var evaluatedData = data;
  var formulaParser = createFormulaParser(evaluatedData);
  try {
    // Iterate over the points in the reference graph, starting from the leaves
    for (
      var _b = __values(referenceGraph.traverseBFSBackwards()), _c = _b.next();
      !_c.done;
      _c = _b.next()
    ) {
      var point = _c.value;
      // Get the cell at the current point in the data Matrix
      var cell = get(point, data);
      if (!cell) {
        continue;
      }
      // If the cell is a formula cell, evaluate it
      if (isFormulaValue(cell.value)) {
        var evaluatedValue = getFormulaComputedValue(
          cell.value,
          point,
          formulaParser
        );
        evaluatedData = set(
          point,
          __assign(__assign({}, cell), { value: evaluatedValue }),
          evaluatedData
        );
        formulaParser = createFormulaParser(evaluatedData);
      }
    }
  } catch (e_4_1) {
    e_4 = { error: e_4_1 };
  } finally {
    try {
      if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
    } finally {
      if (e_4) throw e_4.error;
    }
  }
  return evaluatedData;
}
/** Get the computed value of a formula cell */
function getFormulaComputedValue(value, point, formulaParser) {
  var formula = extractFormula(value);
  try {
    return evaluate(formula, point, formulaParser);
  } catch (e) {
    return FormulaError.REF;
  }
}

var INITIAL_STATE = {
  active: null,
  mode: "view",
  rowDimensions: {},
  columnDimensions: {},
  lastChanged: null,
  hasPasted: false,
  cut: false,
  dragging: false,
  model: new Model(createFormulaParser, []),
  selected: new EmptySelection(),
  copied: null,
  lastCommit: null,
};
function reducer(state, action) {
  var _a, _b, e_1, _c, e_2, _d;
  switch (action.type) {
    case SET_DATA: {
      var data = action.payload.data;
      var nextActive =
        state.active && has(state.active, data) ? state.active : null;
      var nextSelected = state.selected.normalizeTo(data);
      return __assign(__assign({}, state), {
        model: new Model(state.model.createFormulaParser, data),
        active: nextActive,
        selected: nextSelected,
      });
    }
    case SET_CREATE_FORMULA_PARSER: {
      var createFormulaParser_1 = action.payload.createFormulaParser;
      return __assign(__assign({}, state), {
        model: new Model(createFormulaParser_1, state.model.data),
      });
    }
    case SELECT_ENTIRE_ROW: {
      var _e = action.payload,
        row = _e.row,
        extend = _e.extend;
      var active = state.active;
      return __assign(__assign({}, state), {
        selected:
          extend && active
            ? new EntireRowsSelection(active.row, row)
            : new EntireRowsSelection(row, row),
        active:
          extend && active
            ? active
            : __assign(__assign({}, ORIGIN), { row: row }),
        mode: "view",
      });
    }
    case SELECT_ENTIRE_COLUMN: {
      var _f = action.payload,
        column = _f.column,
        extend = _f.extend;
      var active = state.active;
      return __assign(__assign({}, state), {
        selected:
          extend && active
            ? new EntireColumnsSelection(active.column, column)
            : new EntireColumnsSelection(column, column),
        active:
          extend && active
            ? active
            : __assign(__assign({}, ORIGIN), { column: column }),
        mode: "view",
      });
    }
    case SELECT_ENTIRE_WORKSHEET: {
      return __assign(__assign({}, state), {
        selected: new EntireWorksheetSelection(),
        active: ORIGIN,
        mode: "view",
      });
    }
    case SET_SELECTION: {
      var selection = action.payload.selection;
      var range = selection.toRange(state.model.data);
      var active =
        state.active && selection.has(state.model.data, state.active)
          ? state.active
          : range === null || range === void 0
          ? void 0
          : range.start;
      return __assign(__assign({}, state), {
        selected: selection,
        active: active || null,
        mode: "view",
      });
    }
    case SELECT: {
      var point = action.payload.point;
      if (state.active && !isActive(state.active, point)) {
        return __assign(__assign({}, state), {
          selected: new RangeSelection(new PointRange(point, state.active)),
          mode: "view",
        });
      }
      return state;
    }
    case ACTIVATE: {
      var point = action.payload.point;
      return __assign(__assign({}, state), {
        selected: new RangeSelection(new PointRange(point, point)),
        active: point,
        mode: isActive(state.active, point) ? "edit" : "view",
      });
    }
    case SET_CELL_DATA: {
      var _g = action.payload,
        active = _g.active,
        cellData = _g.data;
      if (isActiveReadOnly(state)) {
        return state;
      }
      return __assign(__assign({}, state), {
        model: updateCellValue(state.model, active, cellData),
        lastChanged: active,
      });
    }
    case SET_CELL_DIMENSIONS: {
      var _h = action.payload,
        point = _h.point,
        dimensions = _h.dimensions;
      var prevRowDimensions = state.rowDimensions[point.row];
      var prevColumnDimensions = state.columnDimensions[point.column];
      if (
        prevRowDimensions &&
        prevColumnDimensions &&
        prevRowDimensions.top === dimensions.top &&
        prevRowDimensions.height === dimensions.height &&
        prevColumnDimensions.left === dimensions.left &&
        prevColumnDimensions.width === dimensions.width
      ) {
        return state;
      }
      return __assign(__assign({}, state), {
        rowDimensions: __assign(
          __assign({}, state.rowDimensions),
          ((_a = {}),
          (_a[point.row] = { top: dimensions.top, height: dimensions.height }),
          _a)
        ),
        columnDimensions: __assign(
          __assign({}, state.columnDimensions),
          ((_b = {}),
          (_b[point.column] = {
            left: dimensions.left,
            width: dimensions.width,
          }),
          _b)
        ),
      });
    }
    case COPY:
    case CUT: {
      var selectedRange = state.selected.toRange(state.model.data);
      return __assign(__assign({}, state), {
        copied: selectedRange,
        cut: action.type === CUT,
        hasPasted: false,
      });
    }
    case PASTE: {
      var text = action.payload.data;
      var active = state.active;
      if (!active) {
        return state;
      }
      var copied = split(text, function (value) {
        return { value: value };
      });
      var copiedSize = getSize(copied);
      var selectedRange = state.selected.toRange(state.model.data);
      if (selectedRange && copiedSize.rows === 1 && copiedSize.columns === 1) {
        var cell = get({ row: 0, column: 0 }, copied);
        var newData =
          state.cut && state.copied
            ? unset(state.copied.start, state.model.data)
            : state.model.data;
        var commit_1 = [];
        try {
          for (
            var _j = __values(selectedRange || []), _k = _j.next();
            !_k.done;
            _k = _j.next()
          ) {
            var point = _k.value;
            var currentCell = get(point, state.model.data);
            commit_1.push({
              prevCell: currentCell || null,
              nextCell: cell || null,
            });
            newData = set(point, cell, newData);
          }
        } catch (e_1_1) {
          e_1 = { error: e_1_1 };
        } finally {
          try {
            if (_k && !_k.done && (_c = _j.return)) _c.call(_j);
          } finally {
            if (e_1) throw e_1.error;
          }
        }
        return __assign(__assign({}, state), {
          model: new Model(createFormulaParser, newData),
          copied: null,
          cut: false,
          hasPasted: true,
          mode: "view",
          lastCommit: commit_1,
        });
      }
      var requiredSize = {
        rows: active.row + copiedSize.rows,
        columns: active.column + copiedSize.columns,
      };
      var paddedData = pad(state.model.data, requiredSize);
      var acc = { data: paddedData, commit: [] };
      try {
        for (
          var _l = __values(entries(copied)), _m = _l.next();
          !_m.done;
          _m = _l.next()
        ) {
          var _o = __read(_m.value, 2),
            point = _o[0],
            cell = _o[1];
          var commit_2 = acc.commit || [];
          var nextPoint = {
            row: point.row + active.row,
            column: point.column + active.column,
          };
          var nextData = acc.data;
          if (state.cut) {
            if (state.copied) {
              var prevPoint = {
                row: point.row + state.copied.start.row,
                column: point.column + state.copied.start.column,
              };
              nextData = unset(prevPoint, acc.data);
            }
            commit_2 = __spreadArray(
              __spreadArray([], __read(commit_2), false),
              [{ prevCell: cell || null, nextCell: null }],
              false
            );
          }
          if (!has(nextPoint, paddedData)) {
            acc = { data: nextData, commit: commit_2 };
          }
          var currentCell = get(nextPoint, nextData) || null;
          commit_2 = __spreadArray(
            __spreadArray([], __read(commit_2), false),
            [
              {
                prevCell: currentCell,
                nextCell: cell || null,
              },
            ],
            false
          );
          acc.data = set(
            nextPoint,
            __assign(__assign({ value: undefined }, currentCell), cell),
            nextData
          );
          acc.commit = commit_2;
        }
      } catch (e_2_1) {
        e_2 = { error: e_2_1 };
      } finally {
        try {
          if (_m && !_m.done && (_d = _l.return)) _d.call(_l);
        } finally {
          if (e_2) throw e_2.error;
        }
      }
      return __assign(__assign({}, state), {
        model: new Model(createFormulaParser, acc.data),
        selected: new RangeSelection(
          new PointRange(active, {
            row: active.row + copiedSize.rows - 1,
            column: active.column + copiedSize.columns - 1,
          })
        ),
        copied: null,
        cut: false,
        hasPasted: true,
        mode: "view",
        lastCommit: acc.commit,
      });
    }
    case EDIT: {
      return edit(state);
    }
    case VIEW: {
      return view(state);
    }
    case CLEAR: {
      return clear(state);
    }
    case BLUR: {
      return blur(state);
    }
    case KEY_PRESS: {
      var event_1 = action.payload.event;
      if (isActiveReadOnly(state) || event_1.metaKey) {
        return state;
      }
      if (state.mode === "view" && state.active) {
        return edit(state);
      }
      return state;
    }
    case KEY_DOWN: {
      var event_2 = action.payload.event;
      var handler = getKeyDownHandler(state, event_2);
      if (handler) {
        return __assign(__assign({}, state), handler(state, event_2));
      }
      return state;
    }
    case DRAG_START: {
      return __assign(__assign({}, state), { dragging: true });
    }
    case DRAG_END: {
      return __assign(__assign({}, state), { dragging: false });
    }
    case COMMIT: {
      var changes = action.payload.changes;
      return __assign(__assign({}, state), commit(changes));
    }
    default:
      throw new Error("Unknown action");
  }
}
// const reducer = createReducer(INITIAL_STATE, (builder) => {
//   builder.addMatcher(
//     (action) =>
//       action.type === Actions.copy.type || action.type === Actions.cut.type,
//     (state, action) => {
//     }
//   );
// });
// // Shared reducers
function edit(state) {
  if (isActiveReadOnly(state)) {
    return state;
  }
  return __assign(__assign({}, state), { mode: "edit" });
}
function clear(state) {
  var e_3, _a;
  if (!state.active) {
    return state;
  }
  var canClearCell = function (cell) {
    return cell && !cell.readOnly;
  };
  var clearCell = function (cell) {
    if (!canClearCell(cell)) {
      return cell;
    }
    return Object.assign({}, cell, { value: undefined });
  };
  var selectedRange = state.selected.toRange(state.model.data);
  var changes = [];
  var newData = state.model.data;
  try {
    for (
      var _b = __values(selectedRange || []), _c = _b.next();
      !_c.done;
      _c = _b.next()
    ) {
      var point = _c.value;
      var cell = get(point, state.model.data);
      var clearedCell = clearCell(cell);
      changes.push({
        prevCell: cell || null,
        nextCell: clearedCell || null,
      });
      newData = set(point, clearedCell, newData);
    }
  } catch (e_3_1) {
    e_3 = { error: e_3_1 };
  } finally {
    try {
      if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
    } finally {
      if (e_3) throw e_3.error;
    }
  }
  return __assign(
    __assign(__assign({}, state), {
      model: new Model(createFormulaParser, newData),
    }),
    commit(changes)
  );
}
function blur(state) {
  return __assign(__assign({}, state), {
    active: null,
    selected: new EmptySelection(),
  });
}
function view(state) {
  return __assign(__assign({}, state), { mode: "view" });
}
function commit(changes) {
  return { lastCommit: changes };
}
// Utility
var go = function (rowDelta, columnDelta) {
  return function (state) {
    if (!state.active) {
      return;
    }
    var nextActive = {
      row: state.active.row + rowDelta,
      column: state.active.column + columnDelta,
    };
    if (!has(nextActive, state.model.data)) {
      return __assign(__assign({}, state), { mode: "view" });
    }
    return __assign(__assign({}, state), {
      active: nextActive,
      selected: new RangeSelection(new PointRange(nextActive, nextActive)),
      mode: "view",
    });
  };
};
var keyDownHandlers = {
  ArrowUp: go(-1, 0),
  ArrowDown: go(+1, 0),
  ArrowLeft: go(0, -1),
  ArrowRight: go(0, +1),
  Tab: go(0, +1),
  Enter: edit,
  Backspace: clear,
  Delete: clear,
  Escape: blur,
};
var editKeyDownHandlers = {
  Escape: view,
  Tab: keyDownHandlers.Tab,
  Enter: keyDownHandlers.ArrowDown,
};
var editShiftKeyDownHandlers = {
  Tab: go(0, -1),
};
var Direction;
(function (Direction) {
  Direction["Left"] = "Left";
  Direction["Right"] = "Right";
  Direction["Top"] = "Top";
  Direction["Bottom"] = "Bottom";
})(Direction || (Direction = {}));
var shiftKeyDownHandlers = {
  ArrowUp: function (state) {
    return __assign(__assign({}, state), {
      selected: modifyEdge(
        state.selected,
        state.active,
        state.model.data,
        Direction.Top
      ),
    });
  },
  ArrowDown: function (state) {
    return __assign(__assign({}, state), {
      selected: modifyEdge(
        state.selected,
        state.active,
        state.model.data,
        Direction.Bottom
      ),
    });
  },
  ArrowLeft: function (state) {
    return __assign(__assign({}, state), {
      selected: modifyEdge(
        state.selected,
        state.active,
        state.model.data,
        Direction.Left
      ),
    });
  },
  ArrowRight: function (state) {
    return __assign(__assign({}, state), {
      selected: modifyEdge(
        state.selected,
        state.active,
        state.model.data,
        Direction.Right
      ),
    });
  },
  Tab: go(0, -1),
};
var shiftMetaKeyDownHandlers = {};
var metaKeyDownHandlers = {};
function getKeyDownHandler(state, event) {
  var key = event.key;
  var handlers;
  // Order matters
  if (state.mode === "edit") {
    if (event.shiftKey) {
      handlers = editShiftKeyDownHandlers;
    } else {
      handlers = editKeyDownHandlers;
    }
  } else if (event.shiftKey && event.metaKey) {
    handlers = shiftMetaKeyDownHandlers;
  } else if (event.shiftKey) {
    handlers = shiftKeyDownHandlers;
  } else if (event.metaKey) {
    handlers = metaKeyDownHandlers;
  } else {
    handlers = keyDownHandlers;
  }
  return handlers[key];
}
/** Returns whether the reducer has a handler for the given keydown event */
function hasKeyDownHandler(state, event) {
  return getKeyDownHandler(state, event) !== undefined;
}
/** Returns whether the active cell is read only */
function isActiveReadOnly(state) {
  var activeCell = getActive(state);
  return Boolean(
    activeCell === null || activeCell === void 0 ? void 0 : activeCell.readOnly
  );
}
/** Gets active cell from given state */
function getActive(state) {
  var activeCell = state.active && get(state.active, state.model.data);
  return activeCell || null;
}
/** Modify given edge according to given active point and data */
function modifyEdge(selection, active, data, direction) {
  if (!active) {
    return selection;
  }
  if (selection instanceof RangeSelection) {
    var nextSelection = modifyRangeSelectionEdge(
      selection,
      active,
      data,
      direction
    );
    // @ts-expect-error
    return nextSelection;
  }
  if (selection instanceof EntireColumnsSelection) {
    // @ts-expect-error
    return modifyEntireColumnsSelection(selection, active, data, direction);
  }
  if (selection instanceof EntireRowsSelection) {
    // @ts-expect-error
    return modifyEntireRowsSelection(selection, active, data, direction);
  }
  return selection;
}
function modifyRangeSelectionEdge(rangeSelection, active, data, edge) {
  var _a;
  var field =
    edge === Direction.Left || edge === Direction.Right ? "column" : "row";
  var key = edge === Direction.Left || edge === Direction.Top ? "start" : "end";
  var delta = key === "start" ? -1 : 1;
  var edgeOffsets = rangeSelection.range.has(
    __assign(
      __assign({}, active),
      ((_a = {}), (_a[field] = active[field] + delta * -1), _a)
    )
  );
  var keyToModify = edgeOffsets ? (key === "start" ? "end" : "start") : key;
  var nextRange = new PointRange(
    rangeSelection.range.start,
    rangeSelection.range.end
  );
  nextRange[keyToModify][field] += delta;
  var nextSelection = new RangeSelection(nextRange).normalizeTo(data);
  return nextSelection;
}
function modifyEntireRowsSelection(selection, active, data, edge) {
  if (edge === Direction.Left || edge === Direction.Right) {
    return selection;
  }
  var delta = edge === Direction.Top ? -1 : 1;
  var property = edge === Direction.Top ? "start" : "end";
  var oppositeProperty = property === "start" ? "end" : "start";
  var newSelectionData = __assign({}, selection);
  if (
    edge === Direction.Top
      ? selection.end > active.row
      : selection.start < active.row
  ) {
    newSelectionData[oppositeProperty] = selection[oppositeProperty] + delta;
  } else {
    newSelectionData[property] = selection[property] + delta;
  }
  var nextSelection = new EntireRowsSelection(
    Math.max(newSelectionData.start, 0),
    Math.max(newSelectionData.end, 0)
  );
  return nextSelection.normalizeTo(data);
}
function modifyEntireColumnsSelection(selection, active, data, edge) {
  if (edge === Direction.Top || edge === Direction.Bottom) {
    return selection;
  }
  var delta = edge === Direction.Left ? -1 : 1;
  var property = edge === Direction.Left ? "start" : "end";
  var oppositeProperty = property === "start" ? "end" : "start";
  var newSelectionData = __assign({}, selection);
  if (
    edge === Direction.Left
      ? selection.end > active.row
      : selection.start < active.row
  ) {
    newSelectionData[oppositeProperty] = selection[oppositeProperty] + delta;
  } else {
    newSelectionData[property] = selection[property] + delta;
  }
  var nextSelection = new EntireColumnsSelection(
    Math.max(newSelectionData.start, 0),
    Math.max(newSelectionData.end, 0)
  );
  return nextSelection.normalizeTo(data);
}

var context = createContext([INITIAL_STATE, function () {}]);

var Table = function (_a) {
  var children = _a.children,
    columns = _a.columns,
    hideColumnIndicators = _a.hideColumnIndicators;
  var columnCount = columns + (hideColumnIndicators ? 0 : 1);
  var columnNodes = range(columnCount).map(function (i) {
    return React.createElement("col", { key: i });
  });
  return React.createElement(
    "table",
    { className: "Spreadsheet__table" },
    React.createElement("colgroup", null, columnNodes),
    React.createElement("tbody", null, children)
  );
};

var Row = function (props) {
  return React.createElement("tr", __assign({}, props));
};

var HeaderRow = function (props) {
  return React.createElement("tr", __assign({}, props));
};

function useDispatch() {
  return useContextSelector(context, function (_a) {
    var _b = __read(_a, 2);
    _b[0];
    var dispatch = _b[1];
    return dispatch;
  });
}

function useSelector(selector) {
  return useContextSelector(context, function (_a) {
    var _b = __read(_a, 1),
      state = _b[0];
    return selector(state);
  });
}

var CornerIndicator = function (_a) {
  var selected = _a.selected,
    onSelect = _a.onSelect;
  var handleClick = React.useCallback(
    function () {
      onSelect();
    },
    [onSelect]
  );
  return React.createElement("th", {
    className: classNames("Spreadsheet__header", {
      "Spreadsheet__header--selected": selected,
    }),
    onClick: handleClick,
    tabIndex: 0,
  });
};
var enhance$3 = function (CornerIndicatorComponent) {
  return function CornerIndicatorWrapper(props) {
    var dispatch = useDispatch();
    var selectEntireWorksheet$1 = React.useCallback(
      function () {
        return dispatch(selectEntireWorksheet());
      },
      [dispatch]
    );
    var selected = useSelector(function (state) {
      return state.selected instanceof EntireWorksheetSelection;
    });
    return React.createElement(
      CornerIndicatorComponent,
      __assign({}, props, {
        selected: selected,
        onSelect: selectEntireWorksheet$1,
      })
    );
  };
};

var ColumnIndicator = function (_a) {
  var column = _a.column,
    label = _a.label,
    selected = _a.selected,
    onSelect = _a.onSelect;
  var handleClick = React.useCallback(
    function (event) {
      onSelect(column, event.shiftKey);
    },
    [onSelect, column]
  );
  return React.createElement(
    "th",
    {
      className: classNames("Spreadsheet__header", {
        "Spreadsheet__header--selected": selected,
      }),
      onClick: handleClick,
      tabIndex: 0,
    },
    label !== undefined ? label : columnIndexToLabel(column)
  );
};
var enhance$2 = function (ColumnIndicatorComponent) {
  return function ColumnIndicatorWrapper(props) {
    var dispatch = useDispatch();
    var selectEntireColumn$1 = React.useCallback(
      function (column, extend) {
        return dispatch(selectEntireColumn(column, extend));
      },
      [dispatch]
    );
    var selected = useSelector(function (state) {
      return state.selected.hasEntireColumn(props.column);
    });
    return React.createElement(
      ColumnIndicatorComponent,
      __assign({}, props, {
        selected: selected,
        onSelect: selectEntireColumn$1,
      })
    );
  };
};
function columnIndexToLabel(column) {
  var label = "";
  var index = column;
  while (index >= 0) {
    label = String.fromCharCode(65 + (index % 26)) + label;
    index = Math.floor(index / 26) - 1;
  }
  return label;
}

var RowIndicator = function (_a) {
  var row = _a.row,
    label = _a.label,
    selected = _a.selected,
    onSelect = _a.onSelect;
  var handleClick = React.useCallback(
    function (event) {
      onSelect(row, event.shiftKey);
    },
    [onSelect, row]
  );
  return React.createElement(
    "th",
    {
      className: classNames("Spreadsheet__header", {
        "Spreadsheet__header--selected": selected,
      }),
      onClick: handleClick,
      tabIndex: 0,
    },
    label !== undefined ? label : row + 1
  );
};
var enhance$1 = function (RowIndicatorComponent) {
  return function RowIndicatorWrapper(props) {
    var dispatch = useDispatch();
    var selected = useSelector(function (state) {
      return state.selected.hasEntireRow(props.row);
    });
    var selectEntireRow$1 = React.useCallback(
      function (row, extend) {
        return dispatch(selectEntireRow(row, extend));
      },
      [dispatch]
    );
    return React.createElement(
      RowIndicatorComponent,
      __assign({}, props, { selected: selected, onSelect: selectEntireRow$1 })
    );
  };
};

var Cell = function (_a) {
  var row = _a.row,
    column = _a.column,
    DataViewer = _a.DataViewer,
    selected = _a.selected,
    active = _a.active,
    dragging = _a.dragging,
    mode = _a.mode,
    data = _a.data,
    evaluatedData = _a.evaluatedData,
    select = _a.select,
    activate = _a.activate,
    setCellDimensions = _a.setCellDimensions,
    setCellData = _a.setCellData;
  var rootRef = React.useRef(null);
  var point = React.useMemo(
    function () {
      return {
        row: row,
        column: column,
      };
    },
    [row, column]
  );
  var handleMouseDown = React.useCallback(
    function (event) {
      if (mode === "view") {
        setCellDimensions(point, getOffsetRect(event.currentTarget));
        if (event.shiftKey) {
          select(point);
        } else {
          activate(point);
        }
      }
    },
    [mode, setCellDimensions, point, select, activate]
  );
  var handleMouseOver = React.useCallback(
    function (event) {
      if (dragging) {
        setCellDimensions(point, getOffsetRect(event.currentTarget));
        select(point);
      }
    },
    [setCellDimensions, select, dragging, point]
  );
  React.useEffect(
    function () {
      var root = rootRef.current;
      if (selected && root) {
        setCellDimensions(point, getOffsetRect(root));
      }
      if (root && active && mode === "view") {
        root.focus();
      }
    },
    [setCellDimensions, selected, active, mode, point, data]
  );
  if (data && data.DataViewer) {
    // @ts-ignore
    DataViewer = data.DataViewer;
  }
  return React.createElement(
    "td",
    {
      ref: rootRef,
      className: classNames(
        "Spreadsheet__cell",
        data === null || data === void 0 ? void 0 : data.className,
        {
          "Spreadsheet__cell--readonly":
            data === null || data === void 0 ? void 0 : data.readOnly,
        }
      ),
      onMouseOver: handleMouseOver,
      onMouseDown: handleMouseDown,
      tabIndex: 0,
    },
    React.createElement(DataViewer, {
      row: row,
      column: column,
      cell: data,
      evaluatedCell: evaluatedData,
      setCellData: setCellData,
    })
  );
};
var enhance = function (CellComponent) {
  return function CellWrapper(props) {
    var row = props.row,
      column = props.column;
    var dispatch = useDispatch();
    var point = React.useMemo(
      function () {
        return {
          row: row,
          column: column,
        };
      },
      [row, column]
    );
    var setCellData$1 = React.useCallback(
      function (data) {
        return dispatch(setCellData(point, data));
      },
      [dispatch, point]
    );
    var select$1 = React.useCallback(
      function (point) {
        return dispatch(select(point));
      },
      [dispatch]
    );
    var activate$1 = React.useCallback(
      function (point) {
        return dispatch(activate(point));
      },
      [dispatch]
    );
    var setCellDimensions$1 = React.useCallback(
      function (point, dimensions) {
        return dispatch(setCellDimensions(point, dimensions));
      },
      [dispatch]
    );
    var active = useSelector(function (state) {
      return isActive(state.active, point);
    });
    var mode = useSelector(function (state) {
      return active ? state.mode : "view";
    });
    var data = useSelector(function (state) {
      return get(point, state.model.data);
    });
    var evaluatedData = useSelector(function (state) {
      return get(point, state.model.evaluatedData);
    });
    var selected = useSelector(function (state) {
      return state.selected.has(state.model.data, point);
    });
    var dragging = useSelector(function (state) {
      return state.dragging;
    });
    var copied = useSelector(function (state) {
      var _a;
      return (
        ((_a = state.copied) === null || _a === void 0
          ? void 0
          : _a.has(point)) || false
      );
    });
    return React.createElement(
      CellComponent,
      __assign({}, props, {
        selected: selected,
        active: active,
        copied: copied,
        dragging: dragging,
        mode: mode,
        evaluatedData: evaluatedData,
        data: data,
        select: select$1,
        activate: activate$1,
        setCellDimensions: setCellDimensions$1,
        setCellData: setCellData$1,
      })
    );
  };
};

var TRUE_TEXT = "TRUE";
var FALSE_TEXT = "FALSE";
/** The default Spreadsheet DataViewer component */
var DataViewer = function (_a) {
  var _b;
  var cell = _a.cell,
    evaluatedCell = _a.evaluatedCell;
  var value =
    (_b =
      evaluatedCell === null || evaluatedCell === void 0
        ? void 0
        : evaluatedCell.value) !== null && _b !== void 0
      ? _b
      : cell === null || cell === void 0
      ? void 0
      : cell.value;
  return typeof value === "boolean"
    ? React.createElement(
        "span",
        {
          className:
            "Spreadsheet__data-viewer Spreadsheet__data-viewer--boolean",
        },
        convertBooleanToText(value)
      )
    : React.createElement(
        "span",
        { className: "Spreadsheet__data-viewer" },
        value
      );
};
function convertBooleanToText(value) {
  return value ? TRUE_TEXT : FALSE_TEXT;
}

/** The default Spreadsheet DataEditor component */
var DataEditor = function (_a) {
  var _b;
  var onChange = _a.onChange,
    cell = _a.cell;
  var inputRef = React.useRef(null);
  var handleChange = React.useCallback(
    function (event) {
      onChange(__assign(__assign({}, cell), { value: event.target.value }));
    },
    [onChange, cell]
  );
  React.useEffect(
    function () {
      if (inputRef.current) {
        moveCursorToEnd(inputRef.current);
      }
    },
    [inputRef]
  );
  var value =
    (_b = cell === null || cell === void 0 ? void 0 : cell.value) !== null &&
    _b !== void 0
      ? _b
      : "";
  return React.createElement(
    "div",
    { className: "Spreadsheet__data-editor" },
    React.createElement("input", {
      ref: inputRef,
      type: "text",
      onChange: handleChange,
      value: value,
      autoFocus: true,
    })
  );
};

var ActiveCell = function (props) {
  var rootRef = React.useRef(null);
  var dispatch = useDispatch();
  var setCellData$1 = React.useCallback(
    function (active, data) {
      return dispatch(setCellData(active, data));
    },
    [dispatch]
  );
  var edit = React.useCallback(
    function () {
      return dispatch(edit$1());
    },
    [dispatch]
  );
  var commit = React.useCallback(
    function (changes) {
      return dispatch(commit$1(changes));
    },
    [dispatch]
  );
  var view = React.useCallback(
    function () {
      dispatch(view$1());
    },
    [dispatch]
  );
  var active = useSelector(function (state) {
    return state.active;
  });
  var mode = useSelector(function (state) {
    return state.mode;
  });
  var cell = useSelector(function (state) {
    return state.active ? get(state.active, state.model.data) : undefined;
  });
  var dimensions = useSelector(function (state) {
    return active
      ? getCellDimensions(active, state.rowDimensions, state.columnDimensions)
      : undefined;
  });
  var hidden = React.useMemo(
    function () {
      return !active || !dimensions;
    },
    [active, dimensions]
  );
  var initialCellRef = React.useRef(undefined);
  var prevActiveRef = React.useRef(null);
  var prevCellRef = React.useRef(undefined);
  var handleChange = React.useCallback(
    function (cell) {
      if (!active) {
        return;
      }
      setCellData$1(active, cell);
    },
    [setCellData$1, active]
  );
  React.useEffect(
    function () {
      var root = rootRef.current;
      if (!hidden && root) {
        root.focus();
      }
    },
    [rootRef, hidden]
  );
  React.useEffect(function () {
    var prevActive = prevActiveRef.current;
    var prevCell = prevCellRef.current;
    prevActiveRef.current = active;
    prevCellRef.current = cell;
    if (!prevActive || !prevCell) {
      return;
    }
    // Commit
    var coordsChanged =
      (active === null || active === void 0 ? void 0 : active.row) !==
        prevActive.row ||
      (active === null || active === void 0 ? void 0 : active.column) !==
        prevActive.column;
    var exitedEditMode = mode !== "edit";
    if (coordsChanged || exitedEditMode) {
      var initialCell = initialCellRef.current;
      if (prevCell !== initialCell) {
        commit([
          {
            prevCell: initialCell || null,
            nextCell: prevCell,
          },
        ]);
      } else if (!coordsChanged && cell !== prevCell) {
        commit([
          {
            prevCell: prevCell,
            nextCell: cell || null,
          },
        ]);
      }
      initialCellRef.current = cell;
    }
  });
  var DataEditor = (cell && cell.DataEditor) || props.DataEditor;
  var readOnly = cell && cell.readOnly;
  return hidden
    ? null
    : React.createElement(
        "div",
        {
          ref: rootRef,
          className: classNames(
            "Spreadsheet__active-cell",
            "Spreadsheet__active-cell--".concat(mode)
          ),
          style: dimensions,
          onClick: mode === "view" && !readOnly ? edit : undefined,
          tabIndex: 0,
        },
        mode === "edit" &&
          active &&
          React.createElement(DataEditor, {
            row: active.row,
            column: active.column,
            cell: cell,
            // @ts-ignore
            onChange: handleChange,
            exitEditMode: view,
          })
      );
};

var FloatingRect = function (_a) {
  var _b;
  var dimensions = _a.dimensions,
    dragging = _a.dragging,
    hidden = _a.hidden,
    variant = _a.variant;
  var _c = dimensions || {},
    width = _c.width,
    height = _c.height,
    top = _c.top,
    left = _c.left;
  return React.createElement("div", {
    className: classNames(
      "Spreadsheet__floating-rect",
      ((_b = {}),
      (_b["Spreadsheet__floating-rect--".concat(variant)] = variant),
      (_b["Spreadsheet__floating-rect--dragging"] = dragging),
      (_b["Spreadsheet__floating-rect--hidden"] = hidden),
      _b)
    ),
    style: { width: width, height: height, top: top, left: left },
  });
};

var Selected = function () {
  var selected = useSelector(function (state) {
    return state.selected;
  });
  var dimensions = useSelector(function (state) {
    return (
      selected &&
      getSelectedDimensions(
        state.rowDimensions,
        state.columnDimensions,
        state.model.data,
        state.selected
      )
    );
  });
  var dragging = useSelector(function (state) {
    return state.dragging;
  });
  var hidden = useSelector(function (state) {
    return state.selected.size(state.model.data) < 2;
  });
  return React.createElement(FloatingRect, {
    variant: "selected",
    dimensions: dimensions,
    dragging: dragging,
    hidden: hidden,
  });
};

var Copied = function () {
  var range = useSelector(function (state) {
    return state.copied;
  });
  var dimensions = useSelector(function (state) {
    return (
      range &&
      getRangeDimensions(state.rowDimensions, state.columnDimensions, range)
    );
  });
  var hidden = range === null;
  return React.createElement(FloatingRect, {
    variant: "copied",
    dimensions: dimensions,
    hidden: hidden,
    dragging: false,
  });
};

function styleInject(css, ref) {
  if (ref === void 0) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === "undefined") {
    return;
  }

  var head = document.head || document.getElementsByTagName("head")[0];
  var style = document.createElement("style");
  style.type = "text/css";

  if (insertAt === "top") {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z =
  ".Spreadsheet {\n  --background-color: white;\n  --text-color: black;\n  --readonly-text-color: rgba(0, 0, 0, 0.4);\n  --outline-color: #4285f4;\n  --outline-background-color: rgba(160, 195, 255, 0.2);\n  --border-color: hsl(2deg, 0%, 91%);\n  --header-background-color: rgba(0, 0, 0, 0.04);\n  --elevation: 0 2px 5px rgba(0, 0, 0, 0.4);\n\n  position: relative;\n  overflow: visible;\n  background: var(--background-color);\n  color: var(--text-color);\n  display: inline-block;\n}\n\n.Spreadsheet--dark-mode {\n  --background-color: black;\n  --text-color: white;\n  --readonly-text-color: rgba(255, 255, 255, 0.4);\n  --header-background-color: rgba(255, 255, 255, 0.04);\n  --border-color: hsl(2deg, 0%, 19%);\n}\n\n.Spreadsheet__active-cell {\n  position: absolute;\n  border: 2px solid var(--outline-color);\n  box-sizing: border-box;\n}\n\n.Spreadsheet__active-cell--edit {\n  background: var(--background-color);\n  box-shadow: var(--elevation);\n}\n\n.Spreadsheet__table {\n  border-collapse: collapse;\n  table-layout: fixed;\n}\n\n.Spreadsheet__cell,\n.Spreadsheet__active-cell {\n  cursor: cell;\n}\n\n.Spreadsheet__cell {\n  outline: none;\n}\n\n.Spreadsheet__cell--readonly {\n  color: var(--readonly-text-color);\n}\n\n.Spreadsheet__cell,\n.Spreadsheet__header {\n  min-width: 6em;\n  min-height: 1.9em;\n  height: 1.9em;\n  max-height: 1.9em;\n  border: 1px solid var(--border-color);\n  overflow: hidden;\n  word-break: keep-all;\n  white-space: nowrap;\n  text-align: left;\n  box-sizing: border-box;\n  user-select: none;\n}\n\n.Spreadsheet__header {\n  background: var(--header-background-color);\n  color: var(--readonly-text-color);\n  text-align: center;\n  font: inherit;\n}\n\n.Spreadsheet__header--selected {\n  background: #5f6268;\n  color: #fff;\n}\n\n.Spreadsheet__header,\n.Spreadsheet__data-viewer,\n.Spreadsheet__data-editor input {\n  padding: 4px;\n  box-sizing: border-box;\n}\n\n.Spreadsheet__data-editor,\n.Spreadsheet__data-editor input {\n  width: 100%;\n  height: 100%;\n}\n\n.Spreadsheet__data-editor input {\n  font: inherit;\n  color: inherit;\n  background: none;\n  border: none;\n  outline: none;\n  margin: 0;\n}\n\n.Spreadsheet__data-viewer--boolean {\n  text-align: center;\n}\n\n.Spreadsheet__floating-rect {\n  position: absolute;\n  pointer-events: none;\n  box-sizing: border-box;\n}\n\n.Spreadsheet__floating-rect--hidden {\n  display: none;\n}\n\n.Spreadsheet__floating-rect--selected {\n  background: var(--outline-background-color);\n  border: 2px var(--outline-color) solid;\n}\n\n.Spreadsheet__floating-rect--dragging {\n  border: none;\n}\n\n.Spreadsheet__floating-rect--copied {\n  border: 2px var(--outline-color) dashed;\n}\n";
styleInject(css_248z);

/**
 * The Spreadsheet component
 */
var Spreadsheet = function (props) {
  var className = props.className,
    darkMode = props.darkMode,
    columnLabels = props.columnLabels,
    rowLabels = props.rowLabels,
    hideColumnIndicators = props.hideColumnIndicators,
    hideRowIndicators = props.hideRowIndicators,
    onKeyDown = props.onKeyDown,
    _a = props.Table,
    Table$1 = _a === void 0 ? Table : _a,
    _b = props.Row,
    Row$1 = _b === void 0 ? Row : _b,
    _c = props.HeaderRow,
    HeaderRow$1 = _c === void 0 ? HeaderRow : _c,
    _d = props.DataEditor,
    DataEditor$1 = _d === void 0 ? DataEditor : _d,
    _e = props.DataViewer,
    DataViewer$1 = _e === void 0 ? DataViewer : _e,
    _f = props.onChange,
    onChange = _f === void 0 ? function () {} : _f,
    _g = props.onModeChange,
    onModeChange = _g === void 0 ? function () {} : _g,
    _h = props.onSelect,
    onSelect = _h === void 0 ? function () {} : _h,
    _j = props.onActivate,
    onActivate = _j === void 0 ? function () {} : _j,
    _k = props.onBlur,
    onBlur = _k === void 0 ? function () {} : _k,
    _l = props.onCellCommit,
    onCellCommit = _l === void 0 ? function () {} : _l;
  var initialState = React.useMemo(
    function () {
      var createParser = props.createFormulaParser || createFormulaParser;
      var model = new Model(createParser, props.data);
      return __assign(__assign({}, INITIAL_STATE), {
        model: model,
        selected: props.selected || INITIAL_STATE.selected,
      });
    },
    [props.createFormulaParser, props.data, props.selected]
  );
  var reducerElements = React.useReducer(reducer, initialState);
  var _m = __read(reducerElements, 2),
    state = _m[0],
    dispatch = _m[1];
  var size = React.useMemo(
    function () {
      return calculateSpreadsheetSize(
        state.model.data,
        rowLabels,
        columnLabels
      );
    },
    [state.model.data, rowLabels, columnLabels]
  );
  var mode = state.mode;
  var rootRef = React.useRef(null);
  var copy$1 = React.useCallback(
    function () {
      return dispatch(copy());
    },
    [dispatch]
  );
  var cut$1 = React.useCallback(
    function () {
      return dispatch(cut());
    },
    [dispatch]
  );
  var paste$1 = React.useCallback(
    function (data) {
      return dispatch(paste(data));
    },
    [dispatch]
  );
  var onKeyDownAction = React.useCallback(
    function (event) {
      return dispatch(keyDown(event));
    },
    [dispatch]
  );
  var onKeyPress = React.useCallback(
    function (event) {
      return dispatch(keyPress(event));
    },
    [dispatch]
  );
  var onDragStart = React.useCallback(
    function () {
      return dispatch(dragStart());
    },
    [dispatch]
  );
  var onDragEnd = React.useCallback(
    function () {
      return dispatch(dragEnd());
    },
    [dispatch]
  );
  var setData$1 = React.useCallback(
    function (data) {
      return dispatch(setData(data));
    },
    [dispatch]
  );
  var setCreateFormulaParser$1 = React.useCallback(
    function (createFormulaParser) {
      return dispatch(setCreateFormulaParser(createFormulaParser));
    },
    [dispatch]
  );
  var blur = React.useCallback(
    function () {
      return dispatch(blur$1());
    },
    [dispatch]
  );
  var setSelection$1 = React.useCallback(
    function (selection) {
      return dispatch(setSelection(selection));
    },
    [dispatch]
  );
  // Track active
  var prevActiveRef = React.useRef(state.active);
  React.useEffect(
    function () {
      if (state.active !== prevActiveRef.current) {
        if (state.active) {
          onActivate(state.active);
        } else {
          var root = rootRef.current;
          if (root && isFocusedWithin(root) && document.activeElement) {
            document.activeElement.blur();
          }
          onBlur();
        }
      }
      prevActiveRef.current = state.active;
    },
    [onActivate, onBlur, state.active]
  );
  // Listen to data changes
  var prevDataRef = React.useRef(state.model.data);
  React.useEffect(
    function () {
      if (state.model.data !== prevDataRef.current) {
        // Call on change only if the data change internal
        if (state.model.data !== props.data) {
          onChange(state.model.data);
        }
      }
      prevDataRef.current = state.model.data;
    },
    [state.model.data, onChange, props.data]
  );
  // Listen to selection changes
  var prevSelectedRef = React.useRef(state.selected);
  React.useEffect(
    function () {
      if (!state.selected.equals(prevSelectedRef.current)) {
        // Call on select only if the selection change internal
        if (!props.selected || !state.selected.equals(props.selected)) {
          onSelect(state.selected);
        }
      }
      prevSelectedRef.current = state.selected;
    },
    [state.selected, onSelect, props.selected]
  );
  // Listen to mode changes
  var prevModeRef = React.useRef(state.mode);
  React.useEffect(
    function () {
      if (state.mode !== prevModeRef.current) {
        onModeChange(state.mode);
      }
      prevModeRef.current = state.mode;
    },
    [state.mode, onModeChange]
  );
  // Listen to last commit changes
  var prevLastCommitRef = React.useRef(state.lastCommit);
  React.useEffect(
    function () {
      var e_1, _a;
      if (state.lastCommit && state.lastCommit !== prevLastCommitRef.current) {
        try {
          for (
            var _b = __values(state.lastCommit), _c = _b.next();
            !_c.done;
            _c = _b.next()
          ) {
            var change = _c.value;
            onCellCommit(change.prevCell, change.nextCell, state.lastChanged);
          }
        } catch (e_1_1) {
          e_1 = { error: e_1_1 };
        } finally {
          try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
          } finally {
            if (e_1) throw e_1.error;
          }
        }
      }
    },
    [onCellCommit, state.lastChanged, state.lastCommit]
  );
  // Update selection when props.selected changes
  var prevSelectedPropRef = React.useRef(props.selected);
  React.useEffect(
    function () {
      if (
        props.selected &&
        prevSelectedPropRef.current &&
        !props.selected.equals(prevSelectedPropRef.current)
      ) {
        setSelection$1(props.selected);
      }
      prevSelectedPropRef.current = props.selected;
    },
    [props.selected, setSelection$1]
  );
  // Update data when props.data changes
  var prevDataPropRef = React.useRef(props.data);
  React.useEffect(
    function () {
      if (props.data !== prevDataPropRef.current) {
        setData$1(props.data);
      }
      prevDataPropRef.current = props.data;
    },
    [props.data, setData$1]
  );
  // Update createFormulaParser when props.createFormulaParser changes
  var prevCreateFormulaParserPropRef = React.useRef(props.createFormulaParser);
  React.useEffect(
    function () {
      if (
        props.createFormulaParser !== prevCreateFormulaParserPropRef.current &&
        props.createFormulaParser
      )
        setCreateFormulaParser$1(props.createFormulaParser);
      prevCreateFormulaParserPropRef.current = props.createFormulaParser;
    },
    [props.createFormulaParser, setCreateFormulaParser$1]
  );
  var writeDataToClipboard = React.useCallback(
    function (event) {
      var model = state.model,
        selected = state.selected;
      var data = model.data;
      var range = selected.toRange(data);
      if (range) {
        var selectedData = slice(range.start, range.end, data);
        var csv = getCSV(selectedData);
        writeTextToClipboard(event, csv);
      }
    },
    [state]
  );
  var handleCut = React.useCallback(
    function (event) {
      if (shouldHandleClipboardEvent(rootRef.current, mode)) {
        event.preventDefault();
        event.stopPropagation();
        writeDataToClipboard(event);
        cut$1();
      }
    },
    [mode, writeDataToClipboard, cut$1]
  );
  var handleCopy = React.useCallback(
    function (event) {
      if (shouldHandleClipboardEvent(rootRef.current, mode)) {
        event.preventDefault();
        event.stopPropagation();
        writeDataToClipboard(event);
        copy$1();
      }
    },
    [mode, writeDataToClipboard, copy$1]
  );
  var handlePaste = React.useCallback(
    function (event) {
      if (shouldHandleClipboardEvent(rootRef.current, mode)) {
        event.preventDefault();
        event.stopPropagation();
        if (event.clipboardData) {
          var text = readTextFromClipboard(event);
          paste$1(text);
        }
      }
    },
    [mode, paste$1]
  );
  var handleKeyDown = React.useCallback(
    function (event) {
      event.persist();
      if (onKeyDown) {
        onKeyDown(event);
      }
      // Do not use event in case preventDefault() was called inside onKeyDown
      if (!event.defaultPrevented) {
        // Only disable default behavior if an handler exist
        if (hasKeyDownHandler(state, event)) {
          event.nativeEvent.preventDefault();
        }
        onKeyDownAction(event);
      }
    },
    [state, onKeyDown, onKeyDownAction]
  );
  var handleMouseUp = React.useCallback(
    function () {
      onDragEnd();
      document.removeEventListener("mouseup", handleMouseUp);
    },
    [onDragEnd]
  );
  var handleMouseMove = React.useCallback(
    function (event) {
      if (!state.dragging && event.buttons === 1) {
        onDragStart();
        document.addEventListener("mouseup", handleMouseUp);
      }
    },
    [state, onDragStart, handleMouseUp]
  );
  var handleBlur = React.useCallback(
    function (event) {
      /**
       * Focus left self, Not triggered when swapping focus between children
       * @see https://reactjs.org/docs/events.html#detecting-focus-entering-and-leaving
       */
      if (!event.currentTarget.contains(event.relatedTarget)) {
        blur();
      }
    },
    [blur]
  );
  var Cell$1 = React.useMemo(
    function () {
      // @ts-ignore
      return enhance(props.Cell || Cell);
    },
    [props.Cell]
  );
  var CornerIndicator$1 = React.useMemo(
    function () {
      return enhance$3(props.CornerIndicator || CornerIndicator);
    },
    [props.CornerIndicator]
  );
  var RowIndicator$1 = React.useMemo(
    function () {
      return enhance$1(props.RowIndicator || RowIndicator);
    },
    [props.RowIndicator]
  );
  var ColumnIndicator$1 = React.useMemo(
    function () {
      return enhance$2(props.ColumnIndicator || ColumnIndicator);
    },
    [props.ColumnIndicator]
  );
  React.useEffect(
    function () {
      document.addEventListener("cut", handleCut);
      document.addEventListener("copy", handleCopy);
      document.addEventListener("paste", handlePaste);
      return function () {
        document.removeEventListener("cut", handleCut);
        document.removeEventListener("copy", handleCopy);
        document.removeEventListener("paste", handlePaste);
      };
    },
    [handleCut, handleCopy, handlePaste]
  );
  var tableNode = React.useMemo(
    function () {
      return React.createElement(
        Table$1,
        { columns: size.columns, hideColumnIndicators: hideColumnIndicators },
        React.createElement(
          HeaderRow$1,
          null,
          !hideRowIndicators &&
            !hideColumnIndicators &&
            React.createElement(CornerIndicator$1, null),
          !hideColumnIndicators &&
            range(size.columns).map(function (columnNumber) {
              return columnLabels
                ? React.createElement(ColumnIndicator$1, {
                    key: columnNumber,
                    column: columnNumber,
                    label:
                      columnNumber in columnLabels
                        ? columnLabels[columnNumber]
                        : null,
                  })
                : React.createElement(ColumnIndicator$1, {
                    key: columnNumber,
                    column: columnNumber,
                  });
            })
        ),
        range(size.rows).map(function (rowNumber) {
          return React.createElement(
            Row$1,
            { key: rowNumber, row: rowNumber },
            !hideRowIndicators &&
              (rowLabels
                ? React.createElement(RowIndicator$1, {
                    key: rowNumber,
                    row: rowNumber,
                    label: rowNumber in rowLabels ? rowLabels[rowNumber] : null,
                  })
                : React.createElement(RowIndicator$1, {
                    key: rowNumber,
                    row: rowNumber,
                  })),
            range(size.columns).map(function (columnNumber) {
              return React.createElement(Cell$1, {
                key: columnNumber,
                row: rowNumber,
                column: columnNumber,
                // @ts-ignore
                DataViewer: DataViewer$1,
              });
            })
          );
        })
      );
    },
    [
      Table$1,
      size.rows,
      size.columns,
      hideColumnIndicators,
      Row$1,
      HeaderRow$1,
      hideRowIndicators,
      CornerIndicator$1,
      columnLabels,
      ColumnIndicator$1,
      rowLabels,
      RowIndicator$1,
      Cell$1,
      DataViewer$1,
    ]
  );
  var activeCellNode = React.useMemo(
    function () {
      return React.createElement(
        ActiveCell,
        // @ts-ignore
        {
          // @ts-ignore
          DataEditor: DataEditor$1,
        }
      );
    },
    [DataEditor$1]
  );
  var rootNode = React.useMemo(
    function () {
      return React.createElement(
        "div",
        {
          ref: rootRef,
          className: classNames("Spreadsheet", className, {
            "Spreadsheet--dark-mode": darkMode,
          }),
          onKeyPress: onKeyPress,
          onKeyDown: handleKeyDown,
          onMouseMove: handleMouseMove,
          onBlur: handleBlur,
        },
        tableNode,
        activeCellNode,
        React.createElement(Selected, null),
        React.createElement(Copied, null)
      );
    },
    [
      className,
      darkMode,
      onKeyPress,
      handleKeyDown,
      handleMouseMove,
      handleBlur,
      tableNode,
      activeCellNode,
    ]
  );
  return React.createElement(
    context.Provider,
    { value: reducerElements },
    rootNode
  );
};

export {
  DataEditor,
  DataViewer,
  EmptySelection,
  EntireAxisSelection,
  EntireColumnsSelection,
  EntireRowsSelection,
  EntireSelection,
  EntireWorksheetSelection,
  InvalidIndexError,
  PointRange,
  RangeSelection,
  Selection,
  Spreadsheet,
  createEmpty as createEmptyMatrix,
  createFormulaParser,
  Spreadsheet as default,
};
//# sourceMappingURL=index.js.map
