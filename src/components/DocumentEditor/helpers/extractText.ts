import { textRegex } from "./textRegex";

export function extractTextValues(data) {
  function traverse(item) {
    let accumulator = [];

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
          paragraphText += child.text || (child.blank ? "BLANK" : "");
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
      // questionCounter++;
      const question = item.children.find(
        (child) => child.type === "question-item"
      );

      let questionText = "";
      if (question) {
        questionText = question.children
          .map((child) => child.text.replace(/_+/g, " BLANK "))
          .join("");
      }

      const options = item.children.find((child) => child.type === "ol");
      let optionsText = "";
      if (options) {
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

        options.children.forEach((option, index) => {
          const optionLetter = pronunciationAlphabet[index];
          const isFirstOption = index === 0;
          const isLastOption = index === options.children.length - 1;

          if (isFirstOption) {
            optionsText += `\noption ${optionLetter}: ${option.children[0].text}.. \n`;
          } else if (isLastOption) {
            optionsText += `option ${optionLetter}:  ${option.children[0].text} `;
          } else {
            optionsText += `option ${optionLetter}: ${option.children[0].text}..  \n`;
          }
        });
      }

      if (item.questionNumber) {
        accumulator.push(
          `Question ${item.questionNumber}: ${questionText}${optionsText}`
        );
      }
    }

    if (item.children) {
      item.children.forEach((child) => {
        accumulator.push(...traverse(child));
      });
    }

    return accumulator;
  }

  return traverse({ children: data });
}
