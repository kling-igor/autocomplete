
// https://code.visualstudio.com/docs/getstarted/keybindings

// f1-f19, a-z, 0-9
// `, -, =, [, ], \, ;, ', ,, ., /
// left, up, right, down, pageup, pagedown, end, home
// tab, enter, escape, space, backspace, delete
// pausebreak, capslock, insert
// numpad0-numpad9, numpad_multiply, numpad_add, numpad_separator
// numpad_subtract, numpad_decimal, numpad_divide

// macOS:	Ctrl+, Shift+, Alt+, Cmd+
// Windows:	Ctrl+, Shift+, Alt+, Win+
// Linux:	Ctrl+, Shift+, Alt+, Meta+

export const COMMANDS = [
  { title: 'Something', context: 'File', key: 'ctrl+f12', command: "workspace:action:files:open-file" },
  { title: 'Something Else', context: 'Editor', command: "workspace:action:files:open-file" },
  { title: 'Open...', context: 'File', key: 'ctrl+o', command: "workspace:action:files:open-file" },
  { title: 'Move Line Up', context: 'Editor', key: 'alt+up', command: "editor:action:move-line-up" },
  { title: 'Move Line Down', context: 'Editor', key: 'alt+down', command: "editor:action:move-line-down" }
].sort((a, b) => {
  const aText = a.context ? `${a.context}: ${a.title}` : a.title
  const bText = b.context ? `${b.context}: ${b.title}` : b.title
  return aText.localeCompare(bText)
})
