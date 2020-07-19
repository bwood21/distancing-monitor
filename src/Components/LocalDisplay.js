import React, { Component } from "react";
import './LocalDisplay.css'
import distancing_green from '../Images/distancing_green.png'
import distancing_red from '../Images/distancing_red.png'
import mask_green from '../Images/mask_green.png'
import mask_red from '../Images/mask_red.png'
import firebase, { database } from "firebase"
import firebaseConfig from "./Firebase/firebase";

class LocalDisplay extends Component {
  constructor(props) {
    super(props);
    this.state = {issocialdistancing : true,
                  iswearingmask : true,
                  camID : this.props.match.params.cid,
                  visible : true};
  }
  
  async componentDidMount(){
    this.interval = setInterval(() => {
      this.setState((state, props) => {
        return {
          visible : !state.visible,
        };
      });
    },1000);
    firebase
    .database(firebaseConfig)
    .ref()
    .orderByKey()
    .limitToLast(1)
    //.ref("Cameras/" + this.state.camID)
    .on("value", snapshot => {
          let log = snapshot.child(snapshot.node_.children_.root_.key + "/Cameras/" + this.state.camID)
          if(log.val().mscore > 5){ //TODO: Change this calculation
            this.setState({iswearingmask : false})
          }else{
            this.setState({iswearingmask : true})
          }
          if(log.val().dscore > 5){
            this.setState({issocialdistancing : false})
          }else{
            this.setState({issocialdistancing : true})
          }
    })
  }

  componentWillUnmount = () => {
    clearInterval(this.interval);
  }

  render() {
    const {issocialdistancing, iswearingmask, visible} = this.state;
    return (
      <div className={(issocialdistancing && iswearingmask) ? 'background-green' : ((!issocialdistancing && !iswearingmask) ? 'background-red' : 'background-yellow')}>
          <h1>Social Distancing : {issocialdistancing ? 'Good' : 'Bad'} </h1>
          <h1>Mask Wearing : {iswearingmask ? 'Good' : 'Bad'} </h1>
          <img className={`icons${(visible && !issocialdistancing) ? " transition" : ""}`} src={issocialdistancing ? distancing_green : distancing_red} alt="distancing"></img>
          <img className={`icons${(visible && !iswearingmask) ? " transition" : ""}`} src={iswearingmask ? mask_green : mask_red} alt="distancing"></img>
      </div>
    );
  }
}
export default LocalDisplay
