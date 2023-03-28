// ColumnContainer.js
import { SortableContext } from "@dnd-kit/sortable";
import { verticalListSortingStrategy } from "@dnd-kit/sortable";

export const ColumnContainer = ({ attributes, children, elements }) => {
  return (
    <div {...attributes} className="column-container">
      <SortableContext items={elements} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </div>
  );
};
