import React, { PureComponent } from "react";

import styled, { createGlobalStyle, ThemeProvider } from "styled-components";

import { MenuItem, Dialog, Classes } from "@blueprintjs/core";
import { Suggest } from "@blueprintjs/select";

import { COMMANDS } from "./commands";
import { HELP_COMMANDS } from "./help-commands";
import { FILES } from "./files";

import { JS_SYMBOLS, JSON_SYMBOLS } from './symbols'

import { DARK } from "@blueprintjs/core/lib/esm/common/classes";

const SYMBOLS = JSON_SYMBOLS

let GOTOLINE = [];

// https://code.visualstudio.com/api/references/commands
// https://code.visualstudio.com/docs/getstarted/keybindings
// https://flight-manual.atom.io/behind-atom/sections/keymaps-in-depth/

// https://medium.com/styled-components/styled-components-getting-started-c9818acbcbbd
const GlobalStyle = createGlobalStyle`
  
  /* @import url('https://fonts.googleapis.com/css?family=Roboto');
  @import url('https://netdna.bootstrapcdn.com/font-awesome/3.2.1/css/font-awesome.css'); */

  html {
    height: 100%;
    margin: 0;
  }

  body {
    /* @import "~@blueprintjs/core/lib/css/blueprint.css"; */
    padding: 0;
    margin: 0;
    font-family: Roboto, sans-serif;
    overflow: hidden;
    background-color: white;
    height: 100%;
    margin: 0;
    overflow: hidden !important;
  }

  #app {
    /* background: #272822; */
    min-height: 100%;
    position: fixed;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;

    padding: 8px;
  }

  /* .backdrop {
    top: 24px;
  } */

  /* .bp3-overlay {
    top: 24px;
  } */

  .bp3-dialog {
    border-radius: 0px;
    width: auto;
    height: auto;
    top: 0;
    margin: 0;
    padding: 0;
  }

  .bp3-dialog-body {
    margin: 0;
  }

  .dialog-input {
    width: 100%;
  }

  div > .bp3-menu {
    max-height: 300px;
    overflow-y: auto;
    min-width: 500px;
    max-width: 500px;
    margin-left: -4
  }

  .myinput {
    margin: 4px;
  }

  .bp3-dialog-container {
    align-items: flex-start;
    justify-content: center;
  }

  .menu-item {
    font-size: 13px;
    font-weight: 700;
    line-height: 1em;
  }
`;

// theme:       DARK     LIGHT
// border:     #3c3c3c  #d8d8d8
// background: #313230  #ebebeb
// foreground: #cbcbcb  #686868

const KeyStyle = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 18px;
  margin: 0px;
  margin-left: 1px;
  padding-left: 3px;
  padding-right: 3px;
  border-color: #d8d8d8;
  border-width: 1px;
  border-bottom-width: 2px;
  border-radius: 4px;
  border-style: solid;
  color: #686868;
  background-color: #ebebeb;
  font-size: 12px;
  text-align: center;
  font-family: Roboto, Arial, Helvetica, sans-serif;
`;

const specialKeys = {
  cmd: "⌘",
  ctrl: "⌃",
  alt: "⌥",
  opt: "⎇",
  shift: "⇧",
  meta: "◇",
  win: "❖",
  up: "⇧",
  down: "⇩",
  left: "⇦",
  right: "⇨",
  pageup: "PageUp",
  pagedown: "PageDown",
  end: "End",
  home: "Home",
  tab: "Tab",
  enter: "Enter",
  escape: "Escape",
  space: "Space",
  backspace: "Backspace",
  delete: "Delete"
};

// https://github.com/Microsoft/vscode/issues/27764
// https://github.com/Microsoft/vscode/issues/2628#issuecomment-297566399

// https://github.com/Microsoft/vscode/tree/6511d05ec8f680d2fde87b4b5a1d909f78120697/src/vs/editor/contrib/suggest/media
// https://github.com/Microsoft/vscode/tree/master/src/vs/editor/contrib/documentSymbols/media


const symbolTypes = {
  'class': 'class.svg',
  'constructor': 'method.svg',
  'method': 'method.svg'
}


const symbolIcon = ICONS_PATH => type => {
  let icon = symbolTypes[type.toLowerCase()]
  if (!icon) {
    icon = 'property.svg'
  }

  return `${ICONS_PATH}/${icon}`;
}

const getSymbolIcon = symbolIcon("assets/symbol-icons")

const specialFiles = {
  "readme.md": "readme.svg",
  "package.json": "npm.svg",
  ".gitignore": "git.svg",
  ".npmrc": "npm.svg"
};

const fileExtensions = {
  js: "javascript.svg",
  json: "json.svg",
  md: "markdown.svg",
  txt: "file.svg"
};

const fileExtensionRegex = /\.([0-9a-z]{1,5})$/i;

const fileIcon = ICONS_PATH => name => {
  let icon = specialFiles[name.toLowerCase()];

  if (!icon) {
    const extensionMatch = name.toLowerCase().match(fileExtensionRegex);

    if (extensionMatch) {
      const extension = extensionMatch[1];
      if (extension) {
        icon = fileExtensions[extension.toLowerCase()];
      }
    }
  }

  if (!icon) {
    icon = "file.svg";
  }

  return `${ICONS_PATH}/${icon}`;
};

const getFileIcon = fileIcon("assets/material-icons");

function getKeysLabel(keystroke) {
  if (!keystroke || keystroke === "unassigned") return null;

  const items = keystroke.split("+");
  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    const special = specialKeys[item];
    if (!!special) {
      items[i] = special;
    } else {
      items[i] = items[i].toUpperCase();
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end"
      }}
    >
      {items.map((item, i) => (
        <KeyStyle key={i}>{item}</KeyStyle>
      ))}
    </div>
  );
}

function getDescription(description) {
  return (
    <span
      style={{
        color: "grey"
      }}
    >
      {description}
    </span>
  );
}

function highlightText(text = "", query) {
  let lastIndex = 0;
  const words = query
    .split(/\s+/)
    .filter(word => word.length > 0)
    .map(escapeRegExpChars);
  if (words.length === 0) {
    return [text];
  }
  const regexp = new RegExp(words.join("|"), "gi");
  const tokens = [];
  while (true) {
    const match = regexp.exec(text);
    if (!match) {
      break;
    }
    const length = match[0].length;
    const before = text.slice(lastIndex, regexp.lastIndex - length);
    if (before.length > 0) {
      tokens.push(before);
    }
    lastIndex = regexp.lastIndex;
    tokens.push(
      <strong key={lastIndex} style={{}}>
        {match[0]}
      </strong>
    );
  }
  const rest = text.slice(lastIndex);
  if (rest.length > 0) {
    tokens.push(rest);
  }
  return tokens;
}

function escapeRegExpChars(text) {
  return text.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

const ListItemIconStyle = styled.img`
  margin-right: 4px;
`;

const renderFileMenuItem = (fileName, path, query) => {
  const icon = getFileIcon(fileName);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start"
      }}
    >
      <ListItemIconStyle height="16" width="16" src={icon} />
      <span>
        {highlightText(fileName, query)}
        <span> </span>
        <span style={{ fontSize: "12px", color: "grey" }}>
          {highlightText(path, query)}
        </span>
      </span>
    </div>
  );
};

const renderSymbolItem = (symbol, type, query) => {

  const icon = getSymbolIcon(type)
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start"
      }}
    >
      <ListItemIconStyle height="16" width="16" src={icon} />
      <span>
        {highlightText(symbol, query)}
      </span>
    </div>
  );

}
export default class App extends PureComponent {
  state = {
    command: null,
    suggestions: FILES
  };

  renderInputValue = inputValue => {
    console.log("renderInputValue:", inputValue);
    // console.log("\t", this.state.suggestions);

    if (this.state.suggestions === FILES) {
      // return inputValue;
      const { fileName } = inputValue;
      return fileName;
    }

    if (this.state.suggestions === SYMBOLS) {
      const { symbol } = inputValue
      return symbol
    }

    if (this.state.suggestions === COMMANDS) {
      const { context, title } = inputValue;
      return context ? `${context}: ${title}` : title;
    }
    return inputValue;
  };

  filterCommands = (query, items) => {
    console.log("filterCommands:", items);

    if (query.startsWith(">")) {
      const commandQuery = query.replace(">", "");
      return COMMANDS.filter(({ context, title }) => {
        const text = context ? `${context}: ${title}` : title;
        return text.toLowerCase().indexOf(commandQuery.toLowerCase()) >= 0;
      });
    }

    if (query.startsWith("?")) {
      const commandQuery = query.replace("?", "");
      return HELP_COMMANDS.filter(({ prefix, description }) => {
        const text = `${prefix} ${description}`;
        return text.toLowerCase().indexOf(commandQuery.toLowerCase()) >= 0;
      });
    }

    if (query.startsWith("@")) {
      const commandQuery = query.replace("@", "");
      return SYMBOLS.filter(({ symbol }) => {
        return symbol.toLowerCase().indexOf(commandQuery.toLowerCase()) >= 0;
      });
    }

    if (query.startsWith(":")) {
      const lineNumber = Number.parseInt(query.slice(1));

      if (Number.isNaN(lineNumber)) {
        return [
          "Current line: 265. Type a line number between 1 and 429 to navigate to."
        ];
      }
      return [`Goto line ${lineNumber}.`];
    }

    return FILES.filter(({ fileName, path }) => {
      const text = `${path}/${fileName}`;
      return text.toLowerCase().indexOf(query.toLowerCase()) >= 0;
    });
  };

  renderCommand = (command, { handleClick, modifiers, query }) => {
    if (!modifiers.matchesPredicate) {
      return null;
    }

    // console.log("renderCommand:", command);
    // console.log("\tsuggestions:", this.state.suggestions);

    if (this.state.suggestions === FILES) {
      const { fileName, path } = command;
      return (
        <MenuItem
          active={modifiers.active}
          disabled={modifiers.disabled}
          key={`${path}/${fileName}`}
          onClick={handleClick}
          text={renderFileMenuItem(fileName, path, query)}
          textClassName="menu-item"
        />
      );
    }
    if (this.state.suggestions === SYMBOLS) {
      const { symbol, type, line } = command;
      return (
        <MenuItem
          active={modifiers.active}
          disabled={modifiers.disabled}
          key={`${symbol}/${line}`}
          onClick={handleClick}
          text={renderSymbolItem(symbol, type, query)}
          textClassName="menu-item"
        />
      );
    }
    if (this.state.suggestions === COMMANDS) {
      const { context, key, title } = command;
      const text = context ? `${context}: ${title}` : title;
      return (
        <MenuItem
          active={modifiers.active}
          disabled={modifiers.disabled}
          labelElement={getKeysLabel(key)}
          key={text}
          onClick={handleClick}
          text={highlightText(text, query)}
          textClassName="menu-item"
        />
      );
    }
    if (this.state.suggestions === HELP_COMMANDS) {
      const { prefix, description } = command;
      return (
        <MenuItem
          active={false}// modifiers.active
          disabled={modifiers.disabled}
          // labelElement={getDescription(description)}
          key={`${prefix}`}
          onClick={handleClick}
          text={highlightText(`${prefix} ${description}`, query)}
          textClassName="menu-item"
        />
      );
    }
    if (this.state.suggestions === GOTOLINE) {
      return (
        <MenuItem
          active={false}
          disabled={modifiers.disabled}
          key={command}
          onClick={handleClick}
          text={command}
          textClassName="menu-item"
        />
      );
    }

    return null;
  };

  onQueryChange = query => {
    // console.log("onQueryChange", query);

    const { suggestions } = this.state;

    if (query.startsWith(">")) {
      if (suggestions !== COMMANDS) {
        this.setState({ suggestions: COMMANDS });
      }
    } else if (query.startsWith("?")) {
      if (suggestions !== HELP_COMMANDS) {
        this.setState({ suggestions: HELP_COMMANDS });
      }

      // есть есть второй символ
      // анализируем его
    } else if (query.startsWith(":")) {
      if (suggestions !== GOTOLINE) {
        this.setState({ suggestions: GOTOLINE });
      }
    }
    else if (query.startsWith("@")) {
      if (suggestions !== SYMBOLS) {
        this.setState({ suggestions: SYMBOLS });
      }
    }
    else {
      if (suggestions !== FILES) {
        this.setState({ suggestions: FILES });
      }
    }

    if (query.length === 0) {
      this.setState({ command: null });
    }
  };

  handleValueChange = command => {
    console.log("SELECTED:", command);

    // if (this.state.suggestions === HELP_COMMANDS) {
    //   const index = HELP_COMMANDS.findIndex(
    //     item => item.prefix === command.prefix
    //   );
    //   if (index !== -1) {
    //     switch (command.prefix) {
    //       case ">":
    //         this.setState({ suggestions: COMMANDS, command: null });
    //         console.log(">>>");
    //         break;
    //       case "@":
    //         break;
    //       case ":":
    //         break;
    //       default:
    //         // goto file
    //         this.setState({ suggestions: FILES, command: null });
    //         break;
    //     }
    //   }
    // }

    // this.setState({ command });
  };

  renderNoResults = () => {
    const text =
      this.state.suggestions === COMMANDS
        ? "No commands matching"
        : "No result found";
    return <MenuItem disabled={true} text={text} />;
  };

  render() {
    return (
      <>
        <GlobalStyle />

        <Dialog
          isOpen={true}
          transitionDuration={0}
          backdropClassName="backdrop"
          inputProps={{ small: true, fill: true }}
        >
          <div
            ref={ref => {
              this.divRef = ref;
            }}
            className={Classes.DIALOG_BODY}
            style={{
              width: 500,
              height: 72
            }}
          >
            <Suggest
              items={[]}
              selectedItem={this.state.command}
              itemRenderer={this.renderCommand}
              // itemPredicate={this.filterCommand}
              itemListPredicate={this.filterCommands}
              onQueryChange={this.onQueryChange}
              closeOnSelect={true}
              openOnKeyDown={false}
              resetOnClose={false}
              resetOnQuery={true}
              resetOnSelect={false}
              inputValueRenderer={this.renderInputValue}
              noResults={this.renderNoResults()}
              onItemSelect={this.handleValueChange}
              usePortal={false}
              popoverProps={{
                minimal: true,
                // portalContainer: this.divRef,
                targetClassName: "dialog-input",
                popoverClassName: "popover"
              }}
              inputProps={{
                small: true,
                fill: true,
                className: "myinput",
                placeholder:
                  "Type '?' to get help on the actions you can take from here"
              }}
            />
          </div>
        </Dialog>
      </>
    );
  }
}
