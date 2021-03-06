import React from 'react'
import styled from 'styled-components'

import { MenuItem, Dialog, Classes } from '@blueprintjs/core'
import { Suggest } from '@blueprintjs/select'

const MODE = {
  FILES: Symbol('FILES'),
  RECENT_FILES: Symbol('RECENT_FILES'),
  SYMBOLS: Symbol('SYMBOLS'),
  GOTOLINE: Symbol('GOTOLINE'),
  HELP: Symbol('HELP'),
  COMMANDS: Symbol('COMMANDS')
}

const MODE_BY_PREFIX = {
  '>': MODE.COMMANDS,
  '?': MODE.HELP,
  ':': MODE.GOTOLINE,
  '@': MODE.SYMBOLS
}

const HELP_COMMANDS = [
  { prefix: '...', description: 'Go to File' },
  { prefix: '>', description: 'Show and Run Commands' },
  { prefix: ':', description: 'Go to Line' },
  { prefix: '@', description: 'Go to Symbol in File' }
]

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
`

const specialKeys = {
  cmd: '⌘',
  ctrl: '⌃',
  alt: '⌥',
  opt: '⎇',
  shift: '⇧',
  meta: '◇',
  win: '❖',
  up: '⇧',
  down: '⇩',
  left: '⇦',
  right: '⇨',
  pageup: 'PageUp',
  pagedown: 'PageDown',
  end: 'End',
  home: 'Home',
  tab: 'Tab',
  enter: 'Enter',
  escape: 'Escape',
  space: 'Space',
  backspace: 'Backspace',
  delete: 'Delete'
}

// https://github.com/Microsoft/vscode/issues/27764
// https://github.com/Microsoft/vscode/issues/2628#issuecomment-297566399

// https://github.com/Microsoft/vscode/tree/6511d05ec8f680d2fde87b4b5a1d909f78120697/src/vs/editor/contrib/suggest/media
// https://github.com/Microsoft/vscode/tree/master/src/vs/editor/contrib/documentSymbols/media

const symbolTypes = {
  class: 'class.svg',
  constructor: 'method.svg',
  method: 'method.svg',
  function: 'method.svg',
  variable: 'local-variable.svg',
  constant: 'constant.svg',
  array: 'array.svg',
  boolean: 'boolean-data.svg',
  string: 'string.svg',
  number: 'numeric.svg',
  object: 'namespace.svg',
  color: 'color-palette.svg'
}

const specialFiles = {
  'readme.md': 'readme.svg',
  'package.json': 'npm.svg',
  '.gitignore': 'git.svg',
  '.npmrc': 'npm.svg'
}

const fileExtensions = {
  js: 'javascript.svg',
  json: 'json.svg',
  md: 'markdown.svg',
  txt: 'file.svg'
}

const fileExtensionRegex = /\.([0-9a-z]{1,5})$/i

function getKeysLabel(keystroke) {
  if (!keystroke || keystroke === 'unassigned') return null

  const items = keystroke.split('+')
  for (let i = 0; i < items.length; i += 1) {
    const item = items[i]
    const special = specialKeys[item]
    if (!!special) {
      items[i] = special
    } else {
      items[i] = items[i].toUpperCase()
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end'
      }}
    >
      {items.map((item, i) => (
        <KeyStyle key={i}>{item}</KeyStyle>
      ))}
    </div>
  )
}

function highlightText(text = '', query) {
  let lastIndex = 0
  const words = query
    .split(/\s+/)
    .filter(word => word.length > 0)
    .map(escapeRegExpChars)
  if (words.length === 0) {
    return [text]
  }
  const regexp = new RegExp(words.join('|'), 'gi')
  const tokens = []
  while (true) {
    const match = regexp.exec(text)
    if (!match) {
      break
    }
    const length = match[0].length
    const before = text.slice(lastIndex, regexp.lastIndex - length)
    if (before.length > 0) {
      tokens.push(before)
    }
    lastIndex = regexp.lastIndex
    tokens.push(
      <strong key={lastIndex} style={{}}>
        {match[0]}
      </strong>
    )
  }
  const rest = text.slice(lastIndex)
  if (rest.length > 0) {
    tokens.push(rest)
  }
  return tokens
}

function escapeRegExpChars(text) {
  return text.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1')
}

const ListItemIconStyle = styled.img`
  margin-right: 4px;
`

const DirtyMarker = styled.span`
  color: ${({ darkTheme }) => (darkTheme ? 'white' : 'grey')};
  font: 16px/1em arial, sans-serif;
  margin-right: 4px;
`

export class QuickLaunch extends React.Component {
  state = {
    mode: MODE.RECENT_FILES
  }

  fileIcon = name => {
    let icon = specialFiles[name.toLowerCase()]

    if (!icon) {
      const extensionMatch = name.toLowerCase().match(fileExtensionRegex)

      if (extensionMatch) {
        const extension = extensionMatch[1]
        if (extension) {
          icon = fileExtensions[extension.toLowerCase()]
        }
      }
    }

    if (!icon) {
      icon = 'file.svg'
    }

    return `${this.props.fileIconsPath}/${icon}`
  }

  symbolIcon = type => {
    let icon = symbolTypes[type.toLowerCase()]
    if (!icon) {
      icon = 'property.svg'
    }

    if (this.props.darkTheme) {
      icon = icon.slice(0, -4) + '_dark.svg'
      console.log(icon)
    }

    return `${this.props.symbolIconsPath}/${icon}`
  }

  renderFileMenuItem = (fileName, path, dirty, query) => {
    const icon = this.fileIcon(fileName)

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start'
        }}
      >
        {!!dirty && <DirtyMarker darkTheme={this.props.darkTheme}>●</DirtyMarker>}
        <ListItemIconStyle height="16" width="16" src={icon} />
        <span>
          {highlightText(fileName, query)}
          <span> </span>
          <span style={{ fontSize: '12px', color: 'grey' }}>{highlightText(path, query)}</span>
        </span>
      </div>
    )
  }

  renderSymbolItem = (symbol, type, query) => {
    const icon = this.symbolIcon(type)
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start'
        }}
      >
        <ListItemIconStyle height="16" width="16" src={icon} />
        <span>{highlightText(symbol, query)}</span>
      </div>
    )
  }

  renderInputValue = inputValue => {
    switch (this.state.mode) {
      case MODE.RECENT_FILES:
        const { fileName } = inputValue
        return fileName

      case MODE.SYMBOLS:
        const { symbol } = inputValue
        return symbol

      case MODE.COMMANDS:
        const { context, title } = inputValue
        return context ? `${context}: ${title}` : title
    }

    return inputValue
  }

  filterCommands = (query, items) => {
    if (query.startsWith('>')) {
      const commandQuery = query.replace('>', '')
      return this.props.commands.filter(({ context, title }) => {
        const text = context ? `${context}: ${title}` : title
        return text.toLowerCase().indexOf(commandQuery.toLowerCase()) >= 0
      })
    }

    if (query.startsWith('?')) {
      const commandQuery = query.replace('?', '')
      return HELP_COMMANDS.filter(({ prefix, description }) => {
        const text = `${prefix} ${description}`
        return text.toLowerCase().indexOf(commandQuery.toLowerCase()) >= 0
      })
    }

    if (query.startsWith('@')) {
      const commandQuery = query.replace('@', '')
      return this.props.symbols.filter(({ symbol }) => {
        return symbol.toLowerCase().indexOf(commandQuery.toLowerCase()) >= 0
      })
    }

    if (query.startsWith(':')) {
      const lineNumber = Number.parseInt(query.slice(1))

      if (Number.isNaN(lineNumber)) {
        return [
          `Current line: ${this.props.currentLineNumber}. Type a line number between 1 and ${
            this.props.fileLinesCount
          } to navigate to.`
        ]
      }
      return [`Goto line ${lineNumber}.`]
    }

    if (query.length > 0) {
      return this.props.files.filter(({ fileName, path }) => {
        const text = `${path}/${fileName}`
        return text.toLowerCase().indexOf(query.toLowerCase()) >= 0
      })
    }

    return this.props.recentFiles.filter(({ fileName, path }) => {
      const text = `${path}/${fileName}`
      return text.toLowerCase().indexOf(query.toLowerCase()) >= 0
    })
  }

  renderCommand = (command, { handleClick, modifiers, query }) => {
    if (!modifiers.matchesPredicate) {
      return null
    }

    switch (this.state.mode) {
      case MODE.FILES:
      case MODE.RECENT_FILES:
        const { fileName, path, dirty } = command
        return (
          <MenuItem
            active={modifiers.active}
            disabled={modifiers.disabled}
            key={`${path}/${fileName}`}
            onClick={handleClick}
            text={this.renderFileMenuItem(fileName, path, dirty, query)}
            textClassName="menu-item"
          />
        )

      case MODE.SYMBOLS:
        const { symbol, type, line } = command
        return (
          <MenuItem
            active={modifiers.active}
            disabled={modifiers.disabled}
            key={`${symbol}/${line}`}
            onClick={handleClick}
            text={this.renderSymbolItem(symbol, type, query)}
            textClassName="menu-item"
          />
        )

      case MODE.COMMANDS:
        const { context, key, title } = command
        const text = context ? `${context}: ${title}` : title
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
        )

      case MODE.HELP:
        const { prefix, description } = command
        return (
          <MenuItem
            active={false}
            disabled={modifiers.disabled}
            key={`${prefix}`}
            onClick={handleClick}
            text={highlightText(`${prefix} ${description}`, query)}
            textClassName="menu-item"
          />
        )

      case MODE.GOTOLINE:
        return (
          <MenuItem
            active={false}
            disabled={modifiers.disabled}
            key={command}
            onClick={handleClick}
            text={command}
            textClassName="menu-item"
          />
        )
    }

    return null
  }

  onQueryChange = query => {
    const { mode } = this.state

    // если ничего не введено
    if (query.length === 0) {
      if (mode !== MODE.RECENT_FILES) {
        // показываем список недавних файлов
        this.setState({ mode: MODE.RECENT_FILES })
      }
    } else {
      // иначе берем префикс
      const prefix = query.slice(0, 1)
      // пытаемся определить режим по нему
      const currentMode = MODE_BY_PREFIX[prefix]
      if (currentMode) {
        if (mode !== currentMode) {
          this.setState({ mode: currentMode })
        }

        if (currentMode === MODE.GOTOLINE) {
          const lineNumber = Number.parseInt(query.slice(1))
          if (
            !Number.isNaN(lineNumber) &&
            lineNumber > 0 &&
            lineNumber <= this.props.fileLinesCount &&
            lineNumber !== this.state.lineNumber
          ) {
            this.props.onLineNumberChanged(lineNumber)
            this.setState({ lineNumber })
          }
        }
      } else {
        // если нет подходящего префикса
        if (mode !== MODE.FILES) {
          // тогда это режим показа всех файлов проекта
          this.setState({ mode: MODE.FILES })
        }
      }
    }
  }

  handleValueChange = value => {
    const { mode } = this.state

    switch (mode) {
      case MODE.FILES:
      case MODE.RECENT_FILES:
        this.props.onSelectFile(value)
        return

      case MODE.SYMBOLS:
        this.props.onSelectSymbol(value)
        return

      case MODE.COMMANDS:
        this.props.onSelectCommand(value)
        return
    }
  }

  renderNoResults = () => {
    const text = this.state.mode === MODE.COMMANDS ? 'No commands matching' : 'No result found'
    return <MenuItem disabled={true} text={text} />
  }

  render() {
    return (
      <Dialog
        className={this.props.darkTheme ? 'bp3-dark' : ''}
        isOpen={true}
        transitionDuration={0}
        backdropClassName="backdrop"
        inputProps={{ small: true, fill: true }}
      >
        <div
          ref={ref => {
            this.divRef = ref
          }}
          className={Classes.DIALOG_BODY}
          style={{
            width: 500,
            height: 66 // 72
          }}
        >
          <Suggest
            items={[]}
            itemRenderer={this.renderCommand}
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
              targetClassName: 'dialog-input',
              popoverClassName: 'popover'
            }}
            inputProps={{
              small: true,
              fill: true,
              className: 'quickOpenInput',
              placeholder: "Type '?' to get help on the actions you can take from here"
            }}
          />
        </div>
      </Dialog>
    )
  }
}
