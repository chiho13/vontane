import React, {
  useCallback,
  useMemo,
  useState,
  useEffect,
  createContext,
  useContext,
} from "react";
import { Slate, Editable, withReact, ReactEditor } from "slate-react";
import { Portal } from "react-portal";
import {
  Editor,
  Range,
  Point,
  Node,
  createEditor,
  Element as SlateElement,
} from "slate";
import { withHistory } from "slate-history";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import { genNodeId } from "@/hoc/withID";

export const EditorContext = createContext(null);

const useDraggableNode = (id) => {
  const editor = useContext(EditorContext);
  const [path, setPath] = useState(null);

  useEffect(() => {
    if (id && editor?.children.length > 0) {
      try {
        const [_, nodePath] = Editor.node(editor, id);
        setPath(nodePath);
      } catch (error) {
        console.error("Error finding node:", error);
      }
    }
  }, [id, editor]);

  return path;
};

const TableCell = ({ attributes, children, id }) => {
  //   const editor = useMemo(() => withReact(createEditor()), []);
  const editor = useContext(EditorContext);
  const {
    attributes: sortableAttributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const path = useDraggableNode(id);

  const style = {
    transition,
    transform: isDragging ? undefined : CSS.Transform.toString(transform),
  };

  return (
    <td
      {...attributes}
      {...sortableAttributes}
      ref={(el) => {
        setNodeRef(el);
        if (el && path) {
          // Connect the DOM node to the Slate node
          ReactEditor.setDOMNode(editor, path, el);
        }
      }}
      style={style}
    >
      <div {...listeners} contentEditable={!isDragging}>
        {children}
      </div>
    </td>
  );
};

const Table = ({ attributes, children }) => {
  return (
    <table {...attributes}>
      <tbody>{children}</tbody>
    </table>
  );
};

const TableRow = ({ attributes, children }) => {
  return <tr {...attributes}>{children}</tr>;
};

const tableSortingStrategy = (rectangles, pointerCoordinates) => {
  const sortedRectangles = rectSortingStrategy(rectangles, pointerCoordinates);
  return closestCorners(sortedRectangles, pointerCoordinates);
};

const TablesExample = () => {
  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);
  const editor = useMemo(
    () => withTables(withHistory(withReact(createEditor()))),
    []
  );
  const [value, setValue] = useState<Node[]>(initialValue);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: closestCenter,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const fromTableCell = value.find((node) => node.id === active.id);
      const toTableCell = value.find((node) => node.id === over.id);

      if (fromTableCell && toTableCell) {
        const [, fromPath] = Editor.node(editor, active.id);
        const [, toPath] = Editor.node(editor, over.id);

        const newNodes = JSON.parse(JSON.stringify(value));
        const fromNodePath = fromPath.slice(0, -1);
        const toNodePath = toPath.slice(0, -1);

        // Remove the dragged table cell from its original position
        const fromRowChildren = Node.child(newNodes, fromNodePath);
        fromRowChildren.children.splice(fromPath[fromPath.length - 1], 1);

        // Insert the dragged table cell into its new position
        const toRowChildren = Node.child(newNodes, toNodePath);
        toRowChildren.children.splice(
          toPath[toPath.length - 1],
          0,
          fromTableCell
        );

        setValue(newNodes);
      }
    }
  };

  return (
    <EditorContext.Provider value={editor}>
      <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
        <SortableContext
          items={value.filter((node) => node.type === "table-cell")}
          strategy={closestCenter}
        >
          <Slate editor={editor} value={value} onChange={setValue}>
            <Editable renderElement={renderElement} renderLeaf={renderLeaf} />
          </Slate>
        </SortableContext>
        <DragOverlay>{/* Render your custom drag overlay here */}</DragOverlay>
      </DndContext>
    </EditorContext.Provider>
  );
};

const withTables = (editor) => {
  const { deleteBackward, deleteForward, insertBreak } = editor;

  editor.deleteBackward = (unit) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const [cell] = Editor.nodes(editor, {
        match: (n) =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          n.type === "table-cell",
      });

      if (cell) {
        const [, cellPath] = cell;
        const start = Editor.start(editor, cellPath);

        if (Point.equals(selection.anchor, start)) {
          return;
        }
      }
    }

    deleteBackward(unit);
  };

  editor.deleteForward = (unit) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const [cell] = Editor.nodes(editor, {
        match: (n) =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          n.type === "table-cell",
      });

      if (cell) {
        const [, cellPath] = cell;
        const end = Editor.end(editor, cellPath);

        if (Point.equals(selection.anchor, end)) {
          return;
        }
      }
    }

    deleteForward(unit);
  };

  editor.insertBreak = () => {
    const { selection } = editor;

    if (selection) {
      const [table] = Editor.nodes(editor, {
        match: (n) =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          n.type === "table",
      });

      if (table) {
        return;
      }
    }

    insertBreak();
  };

  return editor;
};

const Element = ({ attributes, children, element }) => {
  const id = element.id || "non-sortable";
  const {
    attributes: sortableAttributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
  };

  switch (element.type) {
    case "table":
      return (
        <table>
          <tbody {...attributes}>{children}</tbody>
        </table>
      );
    case "table-row":
      return <tr {...attributes}>{children}</tr>;
    case "table-cell":
      return (
        <TableCell attributes={attributes} id={element.id}>
          {children}
        </TableCell>
      );
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  return <span {...attributes}>{children}</span>;
};

const initialValue = [
  {
    type: "paragraph",
    children: [
      {
        text: "Since the editor is based on a recursive tree model, similar to an HTML document, you can create complex nested structures, like tables:",
      },
    ],
  },
  {
    type: "table",
    children: [
      {
        type: "table-row",
        children: [
          {
            id: genNodeId(),
            type: "table-cell",
            children: [{ text: "" }],
          },
          {
            id: genNodeId(),
            type: "table-cell",
            children: [{ text: "Human", bold: true }],
          },
          {
            id: genNodeId(),
            type: "table-cell",
            children: [{ text: "Dog", bold: true }],
          },
          {
            id: genNodeId(),
            type: "table-cell",
            children: [{ text: "Cat", bold: true }],
          },
        ],
      },
      {
        type: "table-row",
        children: [
          {
            id: genNodeId(),
            type: "table-cell",
            children: [{ text: "# of Feet", bold: true }],
          },
          {
            id: genNodeId(),
            type: "table-cell",
            children: [{ text: "2" }],
          },
          {
            id: genNodeId(),
            type: "table-cell",
            children: [{ text: "4" }],
          },
          {
            id: genNodeId(),
            type: "table-cell",
            children: [{ text: "4" }],
          },
        ],
      },
      {
        type: "table-row",
        children: [
          {
            id: genNodeId(),
            type: "table-cell",
            children: [{ text: "# of Lives", bold: true }],
          },
          {
            id: genNodeId(),
            type: "table-cell",
            children: [{ text: "1" }],
          },
          {
            id: genNodeId(),
            type: "table-cell",
            children: [{ text: "1" }],
          },
          {
            id: genNodeId(),
            type: "table-cell",
            children: [{ text: "9" }],
          },
        ],
      },
    ],
  },
  {
    type: "paragraph",
    children: [
      {
        text: "This table is just a basic example of rendering a table, and it doesn't have fancy functionality. But you could augment it to add support for navigating with arrow keys, displaying table headers, adding column and rows, or even formulas if you wanted to get really crazy!",
      },
    ],
  },
];

export default TablesExample;
