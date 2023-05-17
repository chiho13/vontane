import { createEditor, Editor, Path, Range, Transforms } from "slate";
import { genNodeId } from "./withID";

export const withNormalizePasting = (editor) => {
  const { insertData } = editor;

  editor.insertData = (data) => {
    const text = data.getData("text/plain");
    const html = data.getData("text/html");

    if (html) {
      const parser = new DOMParser();
      const parsedHtml = parser.parseFromString(html, "text/html");
      let nodesToInsert = [];

      // Create Slate nodes for each paragraph tag
      const paragraphElements = parsedHtml.querySelectorAll("p");
      paragraphElements.forEach((paragraphElement) => {
        // For each paragraph, create a separate Slate node for each text node and bold node
        let children = Array.from(paragraphElement.childNodes).map((node) => {
          if (node.nodeName === "#text") {
            // This is a normal text node
            return { text: node.textContent };
          } else if (node.nodeName === "B") {
            // This is a bold text node
            return { text: node.textContent, bold: true };
          } else {
            // Ignore other types of nodes
            return null;
          }
        });

        // Filter out null values and add the new paragraph to nodesToInsert
        children = children.filter((child) => child !== null);
        if (children.length > 0) {
          nodesToInsert.push({ id: genNodeId(), type: "paragraph", children });
        }
      });

      // Create Slate nodes for each list tag
      const listElements = parsedHtml.querySelectorAll("ul, ol");
      listElements.forEach((listElement) => {
        const listType =
          listElement.nodeName === "UL" ? "bulleted-list" : "numbered-list";
        const listItemElements = listElement.querySelectorAll("li");

        listItemElements.forEach((listItemElement) => {
          let children = Array.from(listItemElement.childNodes).map((node) => {
            if (node.nodeName === "#text") {
              return { text: node.textContent };
            } else if (node.nodeName === "B") {
              return { text: node.textContent, bold: true };
            } else {
              return null;
            }
          });

          children = children.filter((child) => child !== null);
          if (children.length > 0) {
            nodesToInsert.push({ id: genNodeId(), type: listType, children });
          }
        });
      });

      // Insert the new nodes
      if (nodesToInsert.length > 0) {
        Transforms.insertFragment(editor, nodesToInsert);
        return;
      }
    }

    if (text) {
      const lines = text.split(/\r\n|\r|\n/);
      const nodesToInsert = lines
        .filter((line) => line.trim().length > 0)
        .map((line) => ({
          id: genNodeId(),
          type: "paragraph",
          children: [{ text: line }],
        }));

      if (nodesToInsert.length > 0) {
        Transforms.insertFragment(editor, nodesToInsert);
        return;
      }
    }

    insertData(data);
  };

  return editor;
};
