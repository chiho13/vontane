import { textRegex } from "./textRegex";

export function extractTextValues(data) {
  function traverse(item) {
    let accumulator = [];

    if (item.type === "title") {
      accumulator.push(
        ...item.children.map((child) => {
          let text = child.text;

          // Replace % with " percent"
          text = textRegex(text);

          return text;
        })
      );
    }

    if (item.type === "paragraph") {
      accumulator.push(
        ...item.children.map((child) => {
          let text = child.text || (child.blank ? "BLANK" : "");

          // Replace % with " percent"
          text = textRegex(text);

          return text;
        })
      );
    }

    if (item.type === "equation" && item.altText) {
      accumulator.push(item.altText + ".");
    }

    if (item.type === "mcq") {
      // questionCounter++;
      const question = item.children.find(
        (child) => child.type === "list-item"
      );

      if (question) {
        const questionText = question.children
          .map((child) => {
            if (child.blank) {
              return " BLANK ";
            }
            return child.text;
          })
          .join("");

        if (item.questionNumber) {
          accumulator.push(`Question ${item.questionNumber}: ${questionText}`);
        }
      }

      const options = item.children.find((child) => child.type === "ol");
      if (options) {
        const pronunciationAlphabet = [
          "Aye",
          "Bee",
          "See",
          "Dee",
          "Ee",
          "Eff",
          "Gee",
          "Aitch",
          "Eye",
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
            accumulator.push(
              `Is it ${optionLetter}. ${option.children[0].text}.`
            );
          } else if (isLastOption) {
            accumulator.push(`or ${optionLetter}. ${option.children[0].text}.`);
          } else {
            accumulator.push(`${optionLetter}. ${option.children[0].text}.`);
          }
        });
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
