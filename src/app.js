import React, { PureComponent } from 'react'

import { createGlobalStyle } from 'styled-components'

import { COMMANDS } from './commands'
import { FILES, RECENT_FILES } from './files'

import { JS_SYMBOLS, JSON_SYMBOLS } from './symbols'

import { DARK } from '@blueprintjs/core/lib/esm/common/classes'

import { QuickLaunch, symbolIcon, fileIcon } from './quick-launch'

const SYMBOLS = JS_SYMBOLS

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

  .quickOpenInput {
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
`

const getSymbolIcon = symbolIcon('assets/symbol-icons')
const getFileIcon = fileIcon('assets/material-icons')

/**
 * files - список всех файлов проекта или []
 * recentFiles - срез списка или []
 * symbols - все символы текущего файла или []
 * commands - все команды или []
 * fileLinesCount - кол-во строк в файле или 0
 * currentLineNumber - текущая строка в файле [1...fileLinesCount]
 * getSymbolIcon - получение svg-иконки символа на базе его типа
 * getFileIcon - получение svg-иконки файла на базе его типа
 */

export default class App extends PureComponent {
  render() {
    return (
      <>
        <GlobalStyle />

        <QuickLaunch
          files={FILES}
          recentFiles={RECENT_FILES}
          symbols={SYMBOLS}
          commands={COMMANDS}
          fileLinesCount={42}
          currentLineNumber={3}
          getSymbolIcon={getSymbolIcon}
          getFileIcon={getFileIcon}
          onLineNumberChanged={line => {
            console.log('MOVE TO LINE:', line)
          }}
          onSelectCommand={command => {
            console.log('SELECTED COMMANDS:', command)
          }}
          onSelectFile={file => {
            console.log('SELECTED FILE:', file)
          }}
          onSelectSymbol={symbol => {
            console.log('SELECTED SYMBOL:', symbol)
          }}
        />
      </>
    )
  }
}
