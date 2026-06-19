// Tiny, dependency-free syntax highlighter for the SWE simulator's VS Code-style
// editor. Not a real parser — just enough tokenisation (Python + JS) to look
// like Dark+. Returns spans with a colour class per token.

export interface Token {
  text: string;
  cls: string;
}

// VS Code Dark+ palette.
const COLOR = {
  comment: "text-[#6A9955]",
  string: "text-[#CE9178]",
  number: "text-[#B5CEA8]",
  keyword: "text-[#569CD6]",
  literal: "text-[#569CD6]",
  fn: "text-[#DCDCAA]",
  plain: "text-[#D4D4D4]",
};

// Numbered groups (named groups need ES2018+, below this project's TS target).
// 1=comment 2=string 3=number 4=keyword 5=literal 6=function-name.
const TOKEN =
  /(#.*$|\/\/.*$)|("[^"]*"|'[^']*')|(\b\d+(?:\.\d+)?\b)|(\b(?:def|return|if|elif|else|for|while|in|and|or|not|is|global|import|from|class|function|let|const|var|new|await|async|try|except|raise|with|lambda)\b)|(\b(?:True|False|None|null|undefined|true|false|self)\b)|([A-Za-z_]\w*(?=\())/g;

export function highlightLine(text: string): Token[] {
  if (!text) return [{ text: " ", cls: COLOR.plain }];

  const tokens: Token[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  TOKEN.lastIndex = 0;

  while ((m = TOKEN.exec(text)) !== null) {
    if (m.index > last) {
      tokens.push({ text: text.slice(last, m.index), cls: COLOR.plain });
    }
    const cls =
      (m[1] && COLOR.comment) ||
      (m[2] && COLOR.string) ||
      (m[3] && COLOR.number) ||
      (m[4] && COLOR.keyword) ||
      (m[5] && COLOR.literal) ||
      (m[6] && COLOR.fn) ||
      COLOR.plain;
    tokens.push({ text: m[0], cls });
    last = m.index + m[0].length;
  }
  if (last < text.length) tokens.push({ text: text.slice(last), cls: COLOR.plain });
  return tokens;
}
