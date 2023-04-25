export function textRegex(text) {
  // Replace % with " percent"
  text = text.replace(/%/g, " percent");

  // Replace $1 with "1 dollar" and $N with "N dollars" where N > 1
  text = text.replace(/\$([0-9]+)/g, (match, number) => {
    number = parseInt(number, 10);
    return number === 1 ? "1 dollar" : `${number} dollars`;
  });

  // Replace £1 with "1 pound" and £N with "N pounds" where N > 1
  text = text.replace(/£([0-9]+)/g, (match, number) => {
    number = parseInt(number, 10);
    return number === 1 ? "1 pound" : `${number} pounds`;
  });

  return text;
}
