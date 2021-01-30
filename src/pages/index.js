import * as React from "react"
import * as moment from 'moment';
import "./../styles/app.scss"


// styles
const pageStyles = {
  color: "#232129",
  padding: "96px",
  fontFamily: "-apple-system, Roboto, sans-serif, serif",
}
const headingStyles = {
  marginTop: 0,
  marginBottom: 64
}

const chambers = [
  {level: 1, name: "Ruins I"},
  {level: 2, name: "Ruins II"},
  {level: 3, name: "Ruins III"},
  {level: 4, name: "Ruins IV"},
  {level: 5, name: "Ruins V"},
  {level: 6, name: "Tower I"},
  {level: 7, name: "Tower II"},
  {level: 8, name: "Tower III"},
  {level: 9, name: "Tower IV"},
  {level: 10, name: "Tower V"},
  {level: 11, name: "Forest I"},
  {level: 12, name: "Forest II"},
  {level: 13, name: "Forest III"},
  {level: 14, name: "Forest IV"},
  {level: 15, name: "Forest V"},
  {level: 16, name: "Dark I"},
  {level: 17, name: "Dark II"},
  {level: 18, name: "Dark III"},
  {level: 19, name: "Dark IV"},
  {level: 20, name: "Dark V"},
]

// markup
const IndexPage = () => {
  return (
    <main style={pageStyles}>
      <title>HPWU Fortress Tracker</title>
      <h1 style={headingStyles}>
        HPWU Fortress Tracker
      </h1>
      <Tracker/>
    </main>
  )
}

class Tracker extends React.Component {
  state = {
    scenario: {
      chamber: chambers[0],
      rune: 1,
      playerCount: 1
    }
  }

  updateScenario(scenario) {
    this.setState((state) => {
      state.scenario = scenario;
      console.log("New Scenario : " + JSON.stringify(scenario));
      return state;
    })
  }

  render() {
    return (
      <div>
        <div className='topSection'>
          <SelectScenario scenario={this.state.scenario} onScenarioChange={this.updateScenario.bind(this)}/>
          <PlayScenario scenario={this.state.scenario}/>
        </div>
        <div className='statsSection'>
          <Stats/>
        </div>
      </div>
    )
  }
}

class SelectScenario extends React.Component {
  state = {
    chamber: chambers[0],
    rune: 1,
    playerCount: 1
  }

  constructor(props) {
    super(props);
    
    this.state = {
      chamber: this.props.scenario.chamber,
      rune: this.props.scenario.rune,
      playerCount: this.props.scenario.playerCount
    };
  }

  updateScenario = () => {
    this.props.onScenarioChange(this.state);
  }

  selectChamber(chamber) {
    console.log("Selected Chamber " + chamber.name);
    this.setState({chamber: chamber}, this.updateScenario);
  }

  selectRune(level) {
    console.log("Selected rune = " + level);
    this.setState({rune: level}, this.updateScenario);
  }

  selectPlayerCount(nb) {
    console.log("Selected Nb of players = " + nb);
    this.setState({playerCount: nb}, this.updateScenario);
  }

  render() {
    return (
      <div>
        <h2>
          Choose Current Scenario
        </h2>
        <div>
          <h3>Chamber</h3>
          <div className="optionSelector chamberSelector">
              {chambers.map((chamber, index) => {
                const selected = this.state.chamber.level === chamber.level;
                return (
                <div className={`option chamber ${selected ? "selected" : ""}`} 
                     onClick={this.selectChamber.bind(this, chamber)} 
                     role="button" tabIndex={0} key={index}>
                  {chamber.name} 
                </div>)
              })}
          </div>
        </div>
        <div>
          <h3>Rune</h3>
          <div className="optionSelector runesSelector">
              {[1,2,3,4,5].map((level) => {
                const selected = this.state.rune === level;
                return (
                <div className={`option runeLevel ${selected ? "selected" : ""}`} 
                     onClick={this.selectRune.bind(this, level)} 
                     role="button" tabIndex={0} key={level}>
                  {level} 
                </div>)
              })}
          </div>
        </div>
        <div>
          <h3># of Players</h3>
          <div className="optionSelector runesSelector">
              {[1,2,3,4,5,6].map((nb) => {
                const selected = this.state.playerCount === nb;
                return (
                <div className={`option playerCount ${selected ? "selected" : ""}`} 
                     onClick={this.selectPlayerCount.bind(this, nb)} 
                     role="button" tabIndex={0} key={nb}>
                  {nb} 
                </div>)
              })}
          </div>
        </div>
      </div>
    )
  }
}


class PlayScenario extends React.Component {
  state = {
    running: false,
    startTime: null,
    scenario: null,
  }

  constructor(props) {
    super(props);
    this.state.scenario = props.scenario;
  }

  start = () => {
    this.setState({running: true, startTime: moment()});
    
    this.refreshIntervalId = setInterval(() => {
      let target = document.getElementById("fightDuration");
      let duration = moment().diff(this.state.startTime);
      target.innerHTML = "Time : " +moment.utc(duration).format("m [min] ss [s]");
    }, 1000);
  }

  stop = (status) => {
    console.log("Stop with status : " + status );

    let data = {
      scenario: this.state.scenario,
      drop: status === "drop",
      success: status !== "failed"
    };

    if (this.state.running) {
      this.setState({running: false});
      clearInterval(this.refreshIntervalId);

    } else {
      console.log("Just Log One")
    }

    this.addData(data);
  }

  addData = (data) => {
    console.log("Add Data ", data);
  }

  render() {
    let startBar;
    if (this.state.running) {
      startBar = ( <div className="startBar">
        <button className="fightAction" disabled>Start</button>
        <div>
          <span className="runningTime" id="fightDuration"></span>
        </div>
      </div>)
    } else {
      startBar = (<div className="startBar">
        <button className="fightAction" onClick={this.start}>Start</button>
      </div>)
    }

    return (
    <div>
      <div>
        <h2>
          Fight
        </h2>
        {startBar}
        <div className="logBar">
          <button onClick={() => {this.stop("drop")}}>Drop</button>
          <button onClick={() => {this.stop("nodrop")}}>No Drop</button>
          <button onClick={() => {this.stop("failed")}}>Failed</button>
        </div>
      </div>
      <div>
        <h2>
          Log
        </h2>
        <textarea id="log"></textarea>
      </div>
    </div>
  )}
}

const Stats = () => {
  return (
    <div>
      <h2>
        Statistics Data
      </h2>
    </div>
  )
}

export default IndexPage