import React, { PureComponent } from "react";

import styled, { createGlobalStyle, ThemeProvider } from "styled-components";

import { MenuItem, Dialog, Classes } from "@blueprintjs/core";
import { Suggest } from "@blueprintjs/select";

import { COMMANDS } from "./commands";

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
`;

const KeyStyle = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 18px;
  width: 20px;
  padding-left: 1px;
  padding-right: 1px;
  max-width: 40px;
  border-color: #3c3c3c;
  border-width: 0px;
  border-bottom-width: 2px;
  border-radius: 4px;
  border-style: solid;
  color: white;
  background-color: gray;
  font-size: 12px;
  text-align: center;
  margin-left: 1px;
  margin-right: 0px;
  font-family: Roboto, Arial, Helvetica, sans-serif;
`;

const specialKeys = {
  cmd: "⌘",
  ctrl: "⌃",
  alt: "⌥",
  shift: "⇧",
  meta: "◇",
  win: "❖",
  up: "⇧",
  down: "⇩",
  left: "⇦",
  right: "⇨",
  // pageup:'',
  // pagedown:'',
  end: "⤓",
  home: "⤒",
  tab: "",
  enter: "⏎",
  escape: "",
  space: "",
  backspace: "⌫",
  delete: "⌦"
};

function getKeysLabel(key) {
  if (!key || key === "unassigned") return null;

  const items = key.split("+");
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

function highlightText(text, query) {
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
    tokens.push(<strong key={lastIndex}>{match[0]}</strong>);
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

const FILE_LIST = ["index.js", "commands.js", "app.js", "package.json"];

export default class App extends PureComponent {
  state = {
    command: null,
    suggestions: FILE_LIST
  };

  renderInputValue = inputValue => {
    // console.log("renderInputValue:", inputValue);
    // console.log("\t", this.state.suggestions);

    if (this.state.suggestions === FILE_LIST) {
      return inputValue;
    }
    if (this.state.suggestions === COMMANDS) {
      const { context, title } = inputValue;
      return context ? `${context}: ${title}` : title;
    }
    return inputValue;
  };

  filterCommands = (query, items) => {
    // console.log("filterCommands: query:", query);

    if (query.startsWith(">")) {
      const commandQuery = query.replace(">", "");
      return COMMANDS.filter(({ context, title }) => {
        const text = context ? `${context}: ${title}` : title;
        return text.toLowerCase().indexOf(commandQuery.toLowerCase()) >= 0;
      });
    }

    return FILE_LIST.filter(filename => {
      return filename.toLowerCase().indexOf(query.toLowerCase()) >= 0;
    });
  };

  renderCommand = (command, { handleClick, modifiers, query }) => {
    if (!modifiers.matchesPredicate) {
      return null;
    }

    // console.log("renderCommand:", command);
    // console.log("\tsuggestions:", this.state.suggestions);

    if (this.state.suggestions === FILE_LIST) {
      return (
        <MenuItem
          active={modifiers.active}
          disabled={modifiers.disabled}
          key={command}
          onClick={handleClick}
          text={highlightText(command, query)}
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
        // console.log("ACTIVATE COMMANDS");
        this.setState({ suggestions: COMMANDS });
      }
    } else {
      if (suggestions !== FILE_LIST) {
        // console.log("ACTIVATE FILELIST");
        this.setState({ suggestions: FILE_LIST });
      }
    }

    if (query.length === 0) {
      this.setState({ command: null });
    }
  };

  handleValueChange = command => {
    // console.log("SELECTED:", command);
    this.setState({ command });
  };

  renderNoResults = () => {
    let text = "No result found";

    if (this.state.suggestions === COMMANDS) {
      text = "No commands matching";
    }

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

/*
<KeyStyle>⎇</KeyStyle>
*/
