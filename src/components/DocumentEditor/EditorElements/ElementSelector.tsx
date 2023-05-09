import React from "react";
import {
  ParagraphElement,
  DefaultElement,
  EquationElement,
  ColumnElement,
  ColumnCellElement,
  MCQElement,
  OptionList,
  OptionListItem,
  ListItem,
  TitleElement,
  AudioElement,
  SlideBreak,
} from "./index";

export function ElementSelector(props) {
  const { element, attributes, children } = props;
  const InlineChromiumBugfix = () => (
    <span
      contentEditable={false}
      style={{
        fontSize: 0,
      }}
    >
      {String.fromCodePoint(160) /* Non-breaking space */}
    </span>
  );
  switch (element.type) {
    case "title":
      return <TitleElement {...props} />;
    case "slide":
      return <SlideBreak {...props} />;
    case "audio":
      return <AudioElement {...props} />;
    case "paragraph":
      return <ParagraphElement {...props} />;
    case "link":
      return (
        <a
          {...props.attributes}
          className="inline text-blue-500 underline"
          href={props.element.url}
        >
          {children}
        </a>
      );
    case "list-item":
      return <ListItem {...props} />;
    case "equation":
      return <EquationElement {...props} />;
    case "column":
      return <ColumnElement {...props} />;
    case "column-cell":
      return <ColumnCellElement {...props} />;
    case "mcq":
      return <MCQElement {...props} />;
    case "ol":
      return <OptionList {...props} />;
    case "option-list-item":
      return <OptionListItem {...props}>{children}</OptionListItem>;
    default:
      return <DefaultElement {...props} />;
  }
}
