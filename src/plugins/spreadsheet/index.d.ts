import * as React from 'react';
import FormulaParser, { FormulaParserConfig } from 'fast-formula-parser';

/** A cell coordinates in the spreadsheet */
type Point = {
    /** The cell's column */
    column: number;
    /** The cell's row */
    row: number;
};

/**
 * Interface for ranges between two points
 */

/** Range between two points. Creates a normalized range between two given points */
declare class PointRange {
    /** The top-left point */
    start: Point;
    /** The bottom-right point */
    end: Point;
    constructor(source: Point, target: Point);
    /** Iterates through all the existing points in given range */
    [Symbol.iterator](): Iterator<Point>;
    /** Returns the size (rows x columns) of the given range */
    size(): number;
    /** Returns whether given point exists in given range */
    has(point: Point): boolean;
    /** Limits given masked range with given mask */
    mask(mask: PointRange): PointRange;
    /** Returns whether given range is equal to this range */
    equals(range: PointRange): boolean;
}

/** A two-dimensional array of given type T in rows and columns */
type Matrix<T> = Array<Array<T | undefined>>;
/**
 * Creates an empty matrix with given rows and columns
 * @param rows - integer, the amount of rows the matrix should have
 * @param columns - integer, the amount of columns the matrix should have
 * @returns an empty matrix with given rows and columns
 */
declare function createEmpty<T>(rows: number, columns: number): Matrix<T>;

/** Selection from a spreadsheet */
declare abstract class Selection {
    /** Get concrete range of the selection in the given data */
    abstract toRange(data: Matrix<unknown>): PointRange | null;
    /** Normalize the selection according to the given data */
    abstract normalizeTo(data: Matrix<unknown>): this;
    /** Determines whether the given row is entirely selected in given selection */
    abstract hasEntireRow(row: number): boolean;
    /** Determines whether the given column is entirely selected in given selection */
    abstract hasEntireColumn(column: number): boolean;
    /** Get the number of selected points according to given data */
    abstract size(data: Matrix<unknown>): number;
    /** Determines whether the given point is within the selection */
    abstract has(data: Matrix<unknown>, point: Point): boolean;
    /** Determines whether the given selection is equal to this selection */
    abstract equals(selection: Selection): boolean;
}
/** Selection of no cells */
declare class EmptySelection extends Selection {
    toRange(data: Matrix<unknown>): PointRange | null;
    normalizeTo(data: Matrix<unknown>): this;
    hasEntireRow(row: number): boolean;
    hasEntireColumn(column: number): boolean;
    size(): number;
    has(): boolean;
    equals(selection: Selection): boolean;
}
/** Selection of a range of cells */
declare class RangeSelection extends Selection {
    range: PointRange;
    constructor(range: PointRange);
    toRange(data: Matrix<unknown>): PointRange | null;
    normalizeTo(data: Matrix<unknown>): this;
    hasEntireRow(row: number): boolean;
    hasEntireColumn(column: number): boolean;
    size(data: Matrix<unknown>): number;
    has(data: Matrix<unknown>, point: Point): boolean;
    equals(selection: Selection): boolean;
}
/** Selection of an entire part of the spreadsheet */
declare abstract class EntireSelection extends Selection {
}
/** Selection of the entire worksheet */
declare class EntireWorksheetSelection extends EntireSelection {
    toRange(data: Matrix<unknown>): PointRange;
    normalizeTo(data: Matrix<unknown>): this;
    hasEntireColumn(column: number): boolean;
    hasEntireRow(row: number): boolean;
    size(data: Matrix<unknown>): number;
    has(data: Matrix<unknown>, point: Point): boolean;
    equals(selection: Selection): boolean;
}
/** Selection of an entire axis in the spreadsheet */
declare abstract class EntireAxisSelection extends EntireSelection {
    /** Selection start index, integer */
    readonly start: number;
    /** Selection end index, integer */
    readonly end: number;
    /**
     * @param start - row index where the selection starts, integer
     * @param end - row index where the selection ends, integer
     * @throws {@link InvalidIndexError}
     */
    constructor(start: number, end: number);
    equals(selection: Selection): boolean;
}
/** Selection of entire rows in the spreadsheet */
declare class EntireRowsSelection extends EntireAxisSelection {
    toRange(data: Matrix<unknown>): PointRange;
    normalizeTo(data: Matrix<unknown>): this;
    hasEntireRow(row: number): boolean;
    hasEntireColumn(column: number): boolean;
    size(data: Matrix<unknown>): number;
    has(data: Matrix<unknown>, point: Point): boolean;
}
/** Selection of entire columns in the spreadsheet */
declare class EntireColumnsSelection extends EntireAxisSelection {
    toRange(data: Matrix<unknown>): PointRange;
    normalizeTo(data: Matrix<unknown>): this;
    hasEntireRow(row: number): boolean;
    hasEntireColumn(column: number): boolean;
    size(data: Matrix<unknown>): number;
    has(data: Matrix<unknown>, point: Point): boolean;
}
/** Error thrown when passing a non-index value where an index value is expected */
declare class InvalidIndexError extends Error {
    constructor(name: string);
}

declare function createFormulaParser(data: Matrix<CellBase>, config?: Omit<FormulaParserConfig, "onCell" | "onRange">): FormulaParser;

/** The base type of cell data in Spreadsheet */
type CellBase<Value = any> = {
    /** Whether the cell should not be editable */
    readOnly?: boolean;
    /** Class to be given for the cell element */
    className?: string;
    /** The value of the cell */
    value: Value;
    /** Custom component to render when the cell is edited, if not defined would default to the component defined for the Spreadsheet */
    DataEditor?: DataEditorComponent<CellBase<Value>>;
    /** Custom component to render when the cell is viewed, if not defined would default to the component defined for the Spreadsheet */
    DataViewer?: DataViewerComponent<CellBase<Value>>;
};
/**
 * A cell with it's coordinates
 * @deprecated the component does not use cell descriptors anymore. Instead it passes cell point and cell value explicitly.
 */
type CellDescriptor<Cell> = {
    /** The cell's data */
    data: Cell | undefined;
} & Point;
/** The spreadsheet's write mode */
type Mode = "view" | "edit";
/** Dimensions of an element */
type Dimensions = {
    /** The element's width in pixels */
    width: number;
    /** The element's height in pixels */
    height: number;
    /** The distance of the element from it's container top border in pixels */
    top: number;
    /** The distance of the element from it's container left border in pixels */
    left: number;
};
type CellChange<Cell extends CellBase = CellBase> = {
    prevCell: Cell | null;
    nextCell: Cell | null;
};
/** Type of Spreadsheet Cell component props */
type CellComponentProps<Cell extends CellBase = CellBase> = {
    /** The row of the cell */
    row: number;
    /** The column of the cell */
    column: number;
    /** The DataViewer component to be used by the cell */
    DataViewer: DataViewerComponent<Cell>;
    /** Whether the cell is selected */
    selected: boolean;
    /** Whether the cell is active */
    active: boolean;
    /** Whether the cell is copied */
    copied: boolean;
    /** Whether the user is dragging */
    dragging: boolean;
    /** The mode of the cell */
    mode: Mode;
    /** The data of the cell */
    data: Cell | undefined;
    /** The evaluated data of the cell */
    evaluatedData: Cell | undefined;
    /** Select the cell at the given point */
    select: (point: Point) => void;
    /** Activate the cell at the given point */
    activate: (point: Point) => void;
    /** Set the dimensions of the cell at the given point with the given dimensions */
    setCellDimensions: (point: Point, dimensions: Dimensions) => void;
    /** Set data of the cell */
    setCellData: (cell: Cell) => void;
};
/** Type of the Spreadsheet Cell component */
type CellComponent<Cell extends CellBase = CellBase> = React.ComponentType<CellComponentProps<Cell>>;
type DataComponentProps<Cell extends CellBase> = {
    /** The rendered cell by the component */
    cell: Cell | undefined;
} & Point;
/** Type of the Spreadsheet DataViewer component props */
type DataViewerProps<Cell extends CellBase = CellBase> = DataComponentProps<Cell> & {
    /** Set data of the cell */
    setCellData: (cell: Cell) => void;
    evaluatedCell: Cell | undefined;
};
/** Type of the Spreadsheet DataViewer component */
type DataViewerComponent<Cell extends CellBase = CellBase> = React.ComponentType<DataViewerProps<Cell>>;
/** Type of the Spreadsheet DataEditor component props */
type DataEditorProps<Cell extends CellBase = CellBase> = DataComponentProps<Cell> & {
    /** Callback to be called when the cell's value is changed */
    onChange: (cell: Cell) => void;
    /** Callback to be called when edit mode should be exited */
    exitEditMode: () => void;
};
/** Type of the Spreadsheet DataEditor component */
type DataEditorComponent<Cell extends CellBase = CellBase> = React.ComponentType<DataEditorProps<Cell>>;
/** Type of the Spreadsheet Table component props */
type TableProps = React.PropsWithChildren<{
    /** Numebr of columns the table should render */
    columns: number;
    /** Whether column indicators are hidden */
    hideColumnIndicators?: boolean | null;
}>;
/** Type of the Spreadsheet Table component */
type TableComponent = React.ComponentType<TableProps>;
/** Type of the Spreadsheet Row component props */
type RowProps = React.PropsWithChildren<{
    /** The row index of the table */
    row: number;
}>;
/** Type of the Row component */
type RowComponent = React.ComponentType<RowProps>;
/** Type of the Spreadsheet HeaderRow component props */
type HeaderRowProps = React.PropsWithChildren<{}>;
/** Type of the HeaderRow component */
type HeaderRowComponent = React.ComponentType<HeaderRowProps>;
/** Type of the Spreadsheet RowIndicator component props */
type RowIndicatorProps = {
    /** The row the indicator indicates */
    row: number;
    /** A custom label for the indicator as provided in rowLabels */
    label?: React.ReactNode | null;
    /** Whether the entire row is selected */
    selected: boolean;
    /** Callback to be called when the row is selected */
    onSelect: (row: number, extend: boolean) => void;
};
/** Type of the RowIndicator component */
type RowIndicatorComponent = React.ComponentType<RowIndicatorProps>;
/** Type of the Spreadsheet ColumnIndicator component props */
type ColumnIndicatorProps = {
    /** The column the indicator indicates */
    column: number;
    /** A custom label for the indicator as provided in columnLabels */
    label?: React.ReactNode | null;
    /** Whether the entire column in selected */
    selected: boolean;
    /** Callback to be called when the column is selected */
    onSelect: (column: number, extend: boolean) => void;
};
/** Type of the ColumnIndicator component */
type ColumnIndicatorComponent = React.ComponentType<ColumnIndicatorProps>;
/** Type of the Spreadsheet CornerIndicator component props */
type CornerIndicatorProps = {
    /** Whether the entire table is selected */
    selected: boolean;
    /** Callback to select the entire table */
    onSelect: () => void;
};
/** Type of the CornerIndicator component */
type CornerIndicatorComponent = React.ComponentType<CornerIndicatorProps>;
type CreateFormulaParser = (data: Matrix<CellBase>) => FormulaParser;

/** The Spreadsheet component props */
type Props<CellType extends CellBase> = {
    /** The spreadsheet's data */
    data: Matrix<CellType>;
    /** Class name to be added to the spreadsheet's root element */
    className?: string;
    /**
     * Use dark colors that complement dark mode
     * @defaultValue `false`
     */
    darkMode?: boolean;
    /**
     * Function used to create the formula parser (instance of
     * "fast-formula-parser") used by the Spreadsheet by getting the spreadsheet's
     * data.
     * @defaultValue function which creates a formula parser bound to the
     * Spreadsheet's data.
     * @see `createFormulaParser`
     * @see https://www.npmjs.com/package/fast-formula-parser
     */
    createFormulaParser?: CreateFormulaParser;
    /**
     * Labels to use in column indicators.
     * @defaultValue alphabetical labels.
     */
    columnLabels?: string[];
    /**
     * Labels to use in row indicators.
     * @defaultValue row index labels.
     */
    rowLabels?: string[];
    /**
     * If set to true, hides the row indicators of the spreadsheet.
     * @defaultValue `false`.
     */
    hideRowIndicators?: boolean;
    /**
     * If set to true, hides the column indicators of the spreadsheet.
     * @defaultValue `false`.
     */
    hideColumnIndicators?: boolean;
    /** The selected cells in the worksheet. */
    selected?: Selection;
    /** Component rendered above each column. */
    ColumnIndicator?: ColumnIndicatorComponent;
    /** Component rendered in the corner of row and column indicators. */
    CornerIndicator?: CornerIndicatorComponent;
    /** Component rendered next to each row. */
    RowIndicator?: RowIndicatorComponent;
    /** The Spreadsheet's table component. */
    Table?: TableComponent;
    /** The Spreadsheet's row component. */
    Row?: RowComponent;
    /** The spreadsheet's header row component */
    HeaderRow?: HeaderRowComponent;
    /** The Spreadsheet's cell component. */
    Cell?: CellComponent<CellType>;
    /** Component rendered for cells in view mode. */
    DataViewer?: DataViewerComponent<CellType>;
    /** Component rendered for cells in edit mode. */
    DataEditor?: DataEditorComponent<CellType>;
    /** Callback called on key down inside the spreadsheet. */
    onKeyDown?: (event: React.KeyboardEvent) => void;
    /** Callback called when the Spreadsheet's data changes. */
    onChange?: (data: Matrix<CellType>) => void;
    /** Callback called when the Spreadsheet's edit mode changes. */
    onModeChange?: (mode: Mode) => void;
    /** Callback called when the Spreadsheet's selection changes. */
    onSelect?: (selected: Selection) => void;
    /** Callback called when Spreadsheet's active cell changes. */
    onActivate?: (active: Point) => void;
    /** Callback called when the Spreadsheet loses focus */
    onBlur?: () => void;
    onCellCommit?: (prevCell: null | CellType, nextCell: null | CellType, coords: null | Point) => void;
};
/**
 * The Spreadsheet component
 */
declare const Spreadsheet: <CellType extends CellBase<any>>(props: Props<CellType>) => React.ReactElement;

/** The default Spreadsheet DataEditor component */
declare const DataEditor: React.FC<DataEditorProps>;

/** The default Spreadsheet DataViewer component */
declare const DataViewer: <Cell extends CellBase<Value>, Value>({ cell, evaluatedCell, }: DataViewerProps<Cell>) => React.ReactElement;

export { CellBase, CellChange, CellComponent, CellComponentProps, CellDescriptor, ColumnIndicatorComponent, ColumnIndicatorProps, CornerIndicatorComponent, CornerIndicatorProps, DataEditor, DataEditorComponent, DataEditorProps, DataViewer, DataViewerComponent, DataViewerProps, Dimensions, EmptySelection, EntireAxisSelection, EntireColumnsSelection, EntireRowsSelection, EntireSelection, EntireWorksheetSelection, HeaderRowComponent, HeaderRowProps, InvalidIndexError, Matrix, Mode, Point, PointRange, Props, RangeSelection, RowComponent, RowIndicatorComponent, RowIndicatorProps, RowProps, Selection, Spreadsheet, TableComponent, TableProps, createEmpty as createEmptyMatrix, createFormulaParser, Spreadsheet as default };
