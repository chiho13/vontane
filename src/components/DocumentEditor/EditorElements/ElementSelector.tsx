import { EditorContext } from "@/contexts/EditorContext";
import React, { useCallback, useContext, useState } from "react";
import { ReactEditor } from "slate-react";
import {
  LinkElement,
  HeadingElement,
  ParagraphElement,
  DefaultElement,
  EquationElement,
  InlineEquation,
  ColumnElement,
  ColumnCellElement,
  MCQElement,
  OptionList,
  QuestionItem,
  TitleElement,
  ImageElement,
  Embed,
  SlideBreak,
  ListItem,
  ElevenTTSWrapper,
  BlockQuoteElement,
  Mapbox,
} from "./index";

export function ElementSelector(props: {
  attributes: any;
  children: any;
  element: any;
}) {
  const { element, attributes, children } = props;
  const { editor } = useContext(EditorContext);
  const path = ReactEditor.findPath(editor, element);
  const [selectedOption, setSelectedOption] = useState(null);

  const handleOptionPreviewChange = useCallback((id) => {
    setSelectedOption(id);
  }, []);

  switch (element.type) {
    case "title":
      return <TitleElement {...props} />;
    case "slide":
      return <SlideBreak {...props} />;
    case "tts":
      return <ElevenTTSWrapper {...props} />;
    case "map":
      return <Mapbox {...props} />;
    case "image":
      return <ImageElement {...props} />;
    case "embed":
      return <Embed {...props} />;
    case "heading-one":
      return <HeadingElement {...props} tag="h1" />;
    case "heading-two":
      return <HeadingElement {...props} tag="h2" />;
    case "heading-three":
      return <HeadingElement {...props} tag="h3" />;
    case "block-quote":
      return <BlockQuoteElement {...props} />;
    case "paragraph":
      return <ParagraphElement {...props} />;
    case "link":
      return <LinkElement {...props} />;
    case "bulleted-list":
      return (
        <ListItem children={children} element={element} listType="bullet" />
      );

    case "numbered-list":
      return (
        <ListItem children={children} element={element} listType="numbered" />
      );
    case "checked-list":
      return (
        <ListItem children={children} element={element} listType="checkbox" />
      );

    case "question-item":
      return <QuestionItem {...props} />;
    case "equation":
      return <EquationElement {...props} />;
    case "inline-equation":
      return <InlineEquation {...props} />;
    case "column":
      return <ColumnElement {...props} />;
    case "column-cell":
      return <ColumnCellElement {...props} />;
    case "mcq":
      return <MCQElement {...props} />;
    case "ol":
      return <OptionList {...props} />;
    case "option-list-item":
      return (
        <ListItem children={children} element={element} listType="options" />
      );
    default:
      return <DefaultElement {...props} />;
  }
}
