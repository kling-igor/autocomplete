import React, { PureComponent } from "react";

import styled, { createGlobalStyle, ThemeProvider } from "styled-components";

import { MenuItem, Dialog, Classes } from "@blueprintjs/core";
import { Suggest } from "@blueprintjs/select";

import { TOP_100_FILMS } from "./films";

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

  /* .bp3-overlay { */
    /* top: 24px; */
  /* } */

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

  .popover {
    height: 200px;
  }

`;

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

const filterFilm = (query, film) => {
  return (
    `${film.rank}. ${film.title.toLowerCase()} ${film.year}`.indexOf(
      query.toLowerCase()
    ) >= 0
  );
};

const renderFilm = (film, { handleClick, modifiers, query }) => {
  if (!modifiers.matchesPredicate) {
    return null;
  }
  const text = `${film.rank}. ${film.title}`;
  return (
    <MenuItem
      active={modifiers.active}
      disabled={modifiers.disabled}
      label={film.year.toString()}
      key={film.rank}
      onClick={handleClick}
      text={highlightText(text, query)}
    />
  );
};

export default class App extends PureComponent {
  state = {
    film: TOP_100_FILMS[0]
  };

  renderInputValue = film => film.title;

  handleValueChange = film => this.setState({ film });

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
              height: 200,
              padding: 0
            }}
          >
            <Suggest
              items={TOP_100_FILMS}
              itemRenderer={renderFilm}
              itemPredicate={filterFilm}
              closeOnSelect={true}
              openOnKeyDown={true}
              resetOnClose={false}
              resetOnQuery={true}
              resetOnSelect={false}
              inputValueRenderer={this.renderInputValue}
              noResults={<MenuItem disabled={true} text="No results." />}
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
                fill: true
              }}
            />
          </div>
        </Dialog>
      </>
    );
  }
}
