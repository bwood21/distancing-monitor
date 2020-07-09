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
                  camID : 1};
  }
  
  async componentDidMount(){
    firebase
    .database(firebaseConfig)
    .ref("Cameras/" + this.state.camID)
    .on("value", snapshot => {
          if(snapshot.val().mscore > 5){
            this.setState({iswearingmask : false})
          }else{
            this.setState({iswearingmask : true})
          }
          if(snapshot.val().dscore > 5){
            this.setState({issocialdistancing : false})
          }else{
            this.setState({issocialdistancing : true})
          }
    })
  }

  render() {
    const {issocialdistancing, iswearingmask} = this.state;
    return (
      <div className={(issocialdistancing && iswearingmask) ? 'background-green' : ((!issocialdistancing && !iswearingmask) ? 'background-red' : 'background-yellow')}>
          <h1>Social Distancing : {issocialdistancing ? 'Good' : 'Bad'} </h1>
          <h1>Mask Wearing : {iswearingmask ? 'Good' : 'Bad'} </h1>
          <img classname={Image} src={issocialdistancing ? distancing_green : distancing_red} alt="distancing"></img>
          <img src={iswearingmask ? mask_green : mask_red} alt="distancing"></img>
      </div>
    );
  }
}
export default LocalDisplay
