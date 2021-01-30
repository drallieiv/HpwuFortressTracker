import * as React from "react"
import * as moment from 'moment';
import "./../styles/app.scss"

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";

// styles
const pageStyles = {
  color: "#232129",
  padding: "25px 96px",
  fontFamily: "-apple-system, Roboto, sans-serif, serif",
}
const headingStyles = {
  marginTop: 0,
  marginBottom: 12
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
    },
    data: []
  }

  updateScenario = (scenario) => {
    this.setState((state) => {
      state.scenario = scenario;
      console.log("New Scenario : " + JSON.stringify(scenario));
      return state;
    })
  }

  addData = (newData) => {
    let data = this.state.data;
    data.push(newData)
    this.setState({data: data});
  }

  render() {
    return (
      <div>
        <div className='topSection'>
          <SelectScenario scenario={this.state.scenario} onScenarioChange={this.updateScenario}/>
          <PlayScenario scenario={this.state.scenario} onNewData={this.addData}/>
        </div>
        <div className='statsSection'>
          <Stats data={this.state.data}/>
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
    autoRestart: true,
  }

  constructor(props) {
    super(props);
    this.state.scenario = props.scenario;
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.scenario !== undefined) {
      this.setState({scenario: nextProps.scenario});
    }    
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
    let data = {
      scenario: this.state.scenario,
      drop: status === "drop",
      success: status !== "failed"
    };

    if (this.state.running) {
      clearInterval(this.refreshIntervalId);
      data.duration = moment().diff(this.state.startTime);
      if (this.state.autoRestart) {
        document.getElementById("fightDuration").innerHTML = "New Fight";
        this.start();
      } else {
        this.setState({running: false});
      }
    }

    this.addData(data);
  }

  end = () => {
    clearInterval(this.refreshIntervalId);
    this.setState({running: false, startTime: null});
  }

  addData = (data) => {
    console.log("Add Data " + JSON.stringify(data));
    this.props.onNewData(data);
  }

  render() {
    let startBar;
    if (this.state.running) {
      let startButton 
      if (this.state.autoRestart) {
        startButton = <button className="fightAction" onClick={this.end}>Stop</button>
      } else {
        startButton = <button className="fightAction" disabled>Start</button>
      }      
      startBar = ( <div className="startBar">
        {startButton}
        <div>
          <span className="runningTime" id="fightDuration">New Fight</span>
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
      {/*
      <div>
        <h2>
          Log
        </h2>
        <textarea id="log"></textarea>
      </div>
      */}
    </div>
  )}
}

class Stats extends React.Component {
  state = {
    data: [],
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.data !== undefined) {
      this.setState({data: nextProps.data}, this.updateChartData);
    }    
  }

  updateChartData = () => {
    console.log("Update Chart data", this.state.data);

    let computedData = [];

    this.state.data
      .filter((fight) => fight.success === true)
      .forEach((fight) => {
        let serie;
        serie = computedData.find((data) => data.roomLevel === fight.scenario.chamber.level);
        if (serie == null) {
          serie = {
            roomName: fight.scenario.chamber.name,
            roomLevel: fight.scenario.chamber.level,
            drop: 0,
            nodrop: 0,
            timedDrop: 0,
            timedFights: 0,
            timedFightsDuration: 0,
          };
          computedData.push(serie);
        }
        
        if (fight.drop) {
          serie.drop++;
        } else {
          serie.nodrop++;
        }

        if (fight.duration !== undefined) {
          serie.timedFights++;
          if (fight.drop) {
            serie.timedDrop++;
          }
          serie.timedFightsDuration += fight.duration;
        }

      }
    );

    computedData.forEach((data) => {
      if (data.timedDrop > 0) {
        data.averageTimePerDrop = data.timedFightsDuration / data.timedDrop;
        data.dropsPerHour = 60*60*1000 / data.averageTimePerDrop;
      }
    })

    console.log("computedData ", computedData);

    this.dropRatePerRoomChart.data = computedData;
    this.dropPerHourPerRoomChart.data = computedData;

  }

  scenarioHash(scenario) {
    return scenario.chamber.level+"|"+scenario.rune+"|"+scenario.playerCount;
  }

  componentDidMount() {
    this.dropRatePerRoomChart = this.createDropRatePerRoomChart("dropRatePerRoom");
    this.dropPerHourPerRoomChart = this.createDropPerHourPerRoomChart("dropPerHourPerRoom");
  }

  createDropRatePerRoomChart(divRef) {
    let chart = am4core.create(divRef, am4charts.XYChart);

    chart.legend = new am4charts.Legend();

    chart.colors.list = [
      am4core.color("#046b00"),
      am4core.color("rgba(255, 0, 0, 0)"),
    ];

    let roomAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    roomAxis.title.text = "Fortress Rooms";
    roomAxis.dataFields.value = "roomLevel";
    roomAxis.dataFields.category = "roomName";
    
    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = "Drop Rate";
    valueAxis.min = 0;
    valueAxis.max = 100;
    valueAxis.strictMinMax = true;
    valueAxis.calculateTotals = true;
    valueAxis.renderer.minWidth = 50;

    var series1 = chart.series.push(new am4charts.ColumnSeries());
    series1.name = "Drop";
    series1.dataFields.categoryX = "roomName";
    series1.dataFields.valueY = "drop";
    series1.dataFields.valueYShow = "totalPercent";
    series1.dataItems.template.locations.categoryX = 0.5;
    series1.stacked = true;

    let bullet1 = series1.bullets.push(new am4charts.LabelBullet());
    bullet1.interactionsEnabled = false;
    bullet1.label.text = "{valueY.totalPercent.formatNumber('#.00')}%";
    bullet1.locationY = 0.5;
    bullet1.label.fill = am4core.color("#ffffff");

    var series2 = chart.series.push(new am4charts.ColumnSeries());
    series2.name = "No Drop";
    series2.dataFields.categoryX = "roomName";
    series2.dataFields.valueY = "nodrop";
    series2.dataFields.valueYShow = "totalPercent";
    series2.dataItems.template.locations.categoryX = 0.5;
    series2.stacked = true;

    return chart;
  }

  createDropPerHourPerRoomChart(divRef) {
    let chart = am4core.create(divRef, am4charts.XYChart);

    chart.legend = new am4charts.Legend();

    chart.colors.list = [
      am4core.color("#046b00"),
      am4core.color("rgba(255, 0, 0, 0)"),
    ];

    let roomAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    roomAxis.title.text = "Fortress Rooms";
    roomAxis.dataFields.value = "roomLevel";
    roomAxis.dataFields.category = "roomName";
    
    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = "Drop Per Hour";

    var series1 = chart.series.push(new am4charts.ColumnSeries());
    series1.name = "Drop";
    series1.dataFields.categoryX = "roomName";
    series1.dataFields.valueY = "dropsPerHour";
    series1.dataItems.template.locations.categoryX = 0.5;

    let bullet1 = series1.bullets.push(new am4charts.LabelBullet());
    bullet1.interactionsEnabled = false;
    bullet1.label.text = "{valueY.formatNumber('#.00')}";
    bullet1.locationY = 0.5;
    bullet1.label.fill = am4core.color("#ffffff");

    return chart;
  }

  componentWillUnmount() {
    if (this.dropRatePerRoomChart) {
      this.dropRatePerRoomChart.dispose();
    }
  }

  render() {
    return (
      <div>
        <h2>
          Statistics Data
        </h2>
        {/*
        <div>
          <h3>
            Raw Data
          </h3>
          <ul>
            {this.state.data.map((event, index) => {
              return <li key={index}>{this.scenarioHash(event.scenario)} = {event.drop ? "Y" : "N"}</li>
            })}
          </ul>
        </div>
        */}
        <div>
          <div className="statsChart" id="dropRatePerRoom"></div>
          <div className="statsChart" id="dropPerHourPerRoom"></div>
        </div>
      </div>
    )
  }
}

export default IndexPage