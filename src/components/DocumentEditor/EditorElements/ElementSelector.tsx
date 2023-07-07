import { EditorContext } from "@/contexts/EditorContext";
import React, { useContext } from "react";
import { ReactEditor } from "slate-react";
import {
  LinkElement,
  HeadingElement,
  ParagraphElement,
  DefaultElement,
  EquationElement,
  ColumnElement,
  ColumnCellElement,
  MCQElement,
  OptionList,
  OptionListItem,
  QuestionItem,
  TitleElement,
  ImageElement,
  SlideBreak,
  ListItem,
  ElevenTTSWrapper,
} from "./index";

export function ElementSelector(props: {
  attributes: any;
  children: any;
  element: any;
}) {
  const { element, attributes, children } = props;
  const { editor } = useContext(EditorContext);
  const path = ReactEditor.findPath(editor, element);
  switch (element.type) {
    case "title":
      return <TitleElement {...props} />;
    case "slide":
      return <SlideBreak {...props} />;
    case "tts":
      return <ElevenTTSWrapper {...props} />;

    case "image":
      return <ImageElement {...props} />;
    case "heading-one":
      return <HeadingElement {...props} tag="h1" />;
    case "heading-two":
      return <HeadingElement {...props} tag="h2" />;

    case "heading-three":
      return <HeadingElement {...props} tag="h3" />;

    case "paragraph":
      return <ParagraphElement {...props} />;
    case "link":
      return <LinkElement {...props} />;
    case "bulleted-list":
      return <ListItem {...props} listType="bullet" />;

    case "numbered-list":
      return <ListItem {...props} listType="numbered" />;
    case "checked-list":
      return <ListItem {...props} listType="checkbox" />;

    case "question-item":
      return <QuestionItem {...props} />;
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
