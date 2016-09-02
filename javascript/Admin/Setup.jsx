import React from 'react'
import ReactDOM from 'react-dom'
import RunLottery from './RunLottery.jsx'
import Games from './Games.jsx'
import Modal from '../Mixin/Modal.jsx'
import Visitors from './Visitors.jsx'
import Lots from './Lots.jsx'
import Students from './Students.jsx'
import Settings from './Settings.jsx'

/* global $ */

class Setup extends React.Component {
  constructor() {
    super()
    this.state = {
      currentTab: 'games',
      currentGame: null,
      lots: []
    }
    this.loadGame = this.loadGame.bind(this)
    this.loadLots = this.loadLots.bind(this)
    this.changeTab = this.changeTab.bind(this)
  }

  componentDidMount() {
    this.loadGame()
    this.loadLots()
  }

  loadGame() {
    let xhr = $.getJSON('tailgate/Admin/Game', {command: 'getCurrent'})
    xhr.done(function (data) {
      this.setState({currentGame: data})
    }.bind(this))
    return xhr
  }

  loadLots() {
    $.getJSON('tailgate/Admin/Lot', {command: 'list'}).done(function (data) {
      if (data.length < 1) {
        data = []
      }

      this.setState({lots: data})

    }.bind(this))
  }

  changeTab(e) {
    this.setState({currentTab: e})
  }

  startLottery() {
    this.changeTab('lottery')
  }

  render() {
    let pageContent
    let canAdd = false
    if (this.state.currentGame && this.state.currentGame.id !== undefined) {
      canAdd = true
    }
    switch (this.state.currentTab) {
      case 'games':
        pageContent = <Games
          startLottery={this.startLottery}
          lots={this.state.lots}
          loadLots={this.loadLots}
          update={this.updateGame}
          loadGame={this.loadGame}
          game={this.state.currentGame}/>
        break

      case 'lottery':
        pageContent = <RunLottery currentGame={this.state.currentGame} loadGame={this.loadGame}/>
        break

      case 'visitors':
        pageContent = <Visitors game={this.state.currentGame}/>
        break

      case 'lots':
        pageContent = <Lots
          lots={this.state.lots}
          loadLots={this.loadLots}
          game={this.state.currentGame}/>
        break

      case 'students':
        pageContent = <Students canAdd={canAdd} game={this.state.currentGame}/>
        break

      case 'settings':
        pageContent = <Settings replyTo={this.state.replyTo} newStudent={this.state.newStudent}/>
        break
    }

    let cursor = {cursor: 'pointer'}
    return (
      <div>
        <ul className="nav nav-tabs">
          <li
            role="presentation"
            className={this.state.currentTab === 'games' || this.state.currentTab === 'lottery'
            ? 'active'
            : ''}
            onClick={this.changeTab.bind(null, 'games')}>
            <a style={cursor}>Games</a>
          </li>
          <li
            role="presentation"
            className={this.state.currentTab === 'visitors'
            ? 'active'
            : ''}
            onClick={this.changeTab.bind(null, 'visitors')}>
            <a style={cursor}>Visitors</a>
          </li>
          <li
            role="presentation"
            className={this.state.currentTab === 'lots'
            ? 'active'
            : ''}
            onClick={this.changeTab.bind(null, 'lots')}>
            <a style={cursor}>Lots</a>
          </li>
          <li
            role="presentation"
            className={this.state.currentTab === 'students'
            ? 'active'
            : ''}
            onClick={this.changeTab.bind(null, 'students')}>
            <a style={cursor}>Students</a>
          </li>
          <li
            role="presentation"
            className={this.state.currentTab === 'settings'
            ? 'active'
            : ''}
            onClick={this.changeTab.bind(null, 'settings')}>
            <a style={cursor}>Settings</a>
          </li>
        </ul>
        <hr/> {pageContent}
        <Modal/>
      </div>
    )
  }
}

ReactDOM.render(
  <Setup/>, document.getElementById('tailgate-setup'))
