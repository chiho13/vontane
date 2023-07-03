import { textRegex } from "./textRegex";

export function extractTextValues(data) {
  function traverse(item) {
    let accumulator = [];

    if (item.children) {
      item.children.forEach((child) => {
        accumulator.push(...traverse(child));
      });
    }

    if (
      item.type === "title" ||
      item.type === "heading-one" ||
      item.type === "heading-two" ||
      item.type === "heading-three"
    ) {
      accumulator.push(
        ...item.children.map((child) => {
          let text = child.text;

          return `${text}.`;
        })
      );
    }

    if (
      item.type === "paragraph" ||
      item.type === "checked-list" ||
      item.type === "numbered-list" ||
      item.type === "bulleted-list"
    ) {
      let paragraphText = "";
      item.children.forEach((child) => {
        if (child.type === "link") {
          paragraphText += child.children[0].text;
        } else {
          // Check for two or more underscores and replace with 'BLANK'
          const text = child.text.replace(/_+/g, "BLANK");
          paragraphText += text || (child.blank ? "BLANK" : "");
        }
      });

      // Replace % with " percent"
      paragraphText = textRegex(paragraphText);

      if (paragraphText.trim() !== "") {
        // Check if text is not empty
        accumulator.push(paragraphText);
      }
    }

    if (item.type === "equation" && item.altText) {
      accumulator.push(item.altText + ".");
    }

    if (item.type === "mcq") {
      const pronunciationAlphabet = [
        "A",
        "B",
        "C",
        "D",
        "E",
        "Eff",
        "Gee",
        "Aitch",
        "I",
        "Jay",
        "Kay",
        "El",
        "Em",
        "En",
        "Oh",
        "Pee",
        "Cue",
        "Ar",
        "Ess",
        "Tee",
        "You",
        "Vee",
        "Double-You",
        "Ex",
        "Why",
        "Zee",
      ];

      let optionsText = "";

      item.children
        .filter((child) => child.type === "option-list-item")
        .forEach((option, index) => {
          const optionLetter = pronunciationAlphabet[index];
          const isFirstOption = index === 0;
          const isLastOption = index === item.children.length - 1;

          const optionText = option.children[0].text;

          if (isFirstOption) {
            optionsText += `option ${optionLetter} --  ${optionText} -- \n`;
          } else if (isLastOption) {
            optionsText += `option ${optionLetter} --  ${optionText}.`;
          } else {
            optionsText += `option ${optionLetter} -- ${optionText} -- \n`;
          }
        });

      if (optionsText.trim() !== "") {
        accumulator.push(optionsText);
      }
    }

    return accumulator;
  }

  return traverse({ children: data });
}
