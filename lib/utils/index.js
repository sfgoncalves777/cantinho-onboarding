const capitalizeLetter = (string, type) => {
  const lowercaseWords = ['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'no', 'na', 'nos', 'nas'];

  const strategy = {
    firstLetter: (str) =>
      str.charAt(0).toUpperCase() + str.slice(1).toLowerCase(),

    allFirstLetters: (str) =>
      str
        .toLowerCase()
        .split(' ')
        .map((word, index) => {
          if (index > 0 && lowercaseWords.includes(word)) {
            return word;
          }
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ')
  };

  let result = strategy[type](string);

  result = result.replace(/-\s*([a-zA-Z]{2})$/, (_, sigla) => `- ${sigla.toUpperCase()}`);

  return result;
};

module.exports = { capitalizeLetter };