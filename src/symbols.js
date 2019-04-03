export const JS_SYMBOLS = [
  { symbol: "App", type: "class", line: 10 },
  { symbol: "constructor", type: "constructor", line: 11 },
  { symbol: "foo", type: "method", line: 15 },
  { symbol: "abc", type: "variable", line: 16 },
  { symbol: "boo", type: "function", line: 40 },
  { symbol: "CONST", type: "constant", line: 50 }
].sort((a, b) => {
  const aText = `${a.symbol}/${a.line} `;
  const bText = `${b.symbol}/${b.line}`;
  return aText.localeCompare(bText);
});

export const JSON_SYMBOLS = [
  { symbol: "id", type: "string", line: 2 },
  { symbol: "type", type: "string", line: 3 },
  { symbol: "visibility", type: "boolean", line: 4 },
  { symbol: "backgroundColor", type: "color", line: 10 },
  { symbol: "margin", type: "number", line: 15 }
].sort((a, b) => {
  const aText = `${a.symbol}/${a.line} `;
  const bText = `${b.symbol}/${b.line}`;
  return aText.localeCompare(bText);
});
