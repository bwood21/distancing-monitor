import React, { Component } from "react";
import './LocalDisplay.css'
import distancing_green from '../Images/distancing_green.png'
import distancing_red from '../Images/distancing_red.png'
import mask_green from '../Images/mask_green.png'
import mask_red from '../Images/mask_red.png'
import firebase, { database } from "firebase"
import firebaseConfig from "./Firebase/firebase";
const timeinterval = 1000 //milliseconds
const numinterval = 6;
class LocalDisplay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      issocialdistancing: true,
      iswearingmask: true,
      camID: this.props.match.params.cid,
      visible: true,
      seconds: 0,
      mscore: [],
      dscore: [],
      pscore: []
    };
  }

  async componentDidMount() {
    this.interval = setInterval(() => {
      this.setState((state, props) => {
        return {
          visible: !state.visible,
        };
      });
    }, 1000);
    firebase
      .database(firebaseConfig)
      .ref()
      .orderByKey()
      .limitToLast(1)
      //.ref("Cameras/" + this.state.camID)
      .once("value", snapshot => {
        let log = snapshot.child(snapshot.node_.children_.root_.key + "/Cameras/" + this.state.camID)
        this.setState({mscore: log.val().mscore, dscore: log.val().dscore, pscore: log.val().pscore})
        if (log.val().mscore[0] > 5) { //TODO: Change this calculation
          this.setState({ iswearingmask: false })
        } else {
          this.setState({ iswearingmask: true })
        }
        if (log.val().dscore[0] > 5) {
          this.setState({ issocialdistancing: false })
        } else {
          this.setState({ issocialdistancing: true })
        }
      })
    this.WatchTimer()
  }

  WatchTimer() { //poor mans video sync
    let interval = null;
    firebase
      .database(firebaseConfig)
      .ref()
      .orderByKey()
      .limitToLast(1)
      .on("value", snapshot => {
        let activity = snapshot.child(snapshot.node_.children_.root_.key + "/Cameras/" + this.state.camID + "/Active")
        if (activity.val() === true) { //could cause problems if checks too much
          interval = setInterval(() => {
            this.setState({ seconds: this.state.seconds + 1 })
            if (this.state.seconds > numinterval) {
              this.resetPlayback()
              clearInterval(interval)
            }
            this.setScores();
          }, timeinterval);
        }
      })
    return () => clearInterval(interval);
  }

  resetPlayback() {
    this.setState({ seconds: 0 })
  }

  componentWillUnmount = () => {
    clearInterval(this.interval);
  }

  setScores() { //duplicate code, change later
    console.log(this.state.mscore[this.state.seconds])
    if (this.state.mscore[this.state.seconds] < (this.state.pscore[this.state.seconds] * .8)) { //80% required for good status
      this.setState({ iswearingmask: false })
    } else {
      this.setState({ iswearingmask: true })
    }
    if (this.state.dscore[this.state.seconds] < (this.state.pscore[this.state.seconds] * .8)) { //80% required for good status
      this.setState({ issocialdistancing: false })
    } else {
      this.setState({ issocialdistancing: true })
    }
  }

  render() {
    const { issocialdistancing, iswearingmask, visible } = this.state;
    return (
    <div id = "colors">
      <div className={(issocialdistancing && iswearingmask) ? 'background-green' : ((!issocialdistancing && !iswearingmask) ? 'background-red' : 'background-yellow')}>
        <h1>Social Distancing : {issocialdistancing ? 'Good' : 'Bad'} </h1>
        <h1>Mask Wearing : {iswearingmask ? 'Good' : 'Bad'} </h1>
        <img className={`icons${(visible && !issocialdistancing) ? " transition" : ""}`} src={issocialdistancing ? distancing_green : distancing_red} alt="distancing"></img>
        <img className={`icons${(visible && !iswearingmask) ? " transition" : ""}`} src={iswearingmask ? mask_green : mask_red} alt="distancing"></img>
      </div>
    </div>
  
    );
  }
}
export default LocalDisplay
