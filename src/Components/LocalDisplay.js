import React, { Component } from "react";
import './LocalDisplay.css'
import distancing_green from '../Images/distancing_green.png'
import distancing_red from '../Images/distancing_red.png'
import mask_green from '../Images/mask_green.png'
import mask_red from '../Images/mask_red.png'
class LocalDisplay extends Component {
  constructor(props) {
    super(props);
    this.state = {issocialdistancing : true,
                  iswearingmask : true};
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
