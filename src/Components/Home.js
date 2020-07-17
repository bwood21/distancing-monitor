import React, { Component } from "react";
import 'office-ui-fabric-react/dist/css/fabric.css';
import { PrimaryButton } from "office-ui-fabric-react";
import { Card } from "@uifabric/react-cards";
import { Stack } from "office-ui-fabric-react/lib/Stack";
import { TextField } from "office-ui-fabric-react/lib/TextField";
import { MarqueeSelection } from "office-ui-fabric-react/lib/MarqueeSelection";
import {
  DetailsList,
  DetailsListLayoutMode,
} from "office-ui-fabric-react/lib/DetailsList";
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox'; 
import { Fabric } from "office-ui-fabric-react/lib/Fabric";
import { DetailsRow } from "office-ui-fabric-react/lib/DetailsList";
import {
  Dropdown
} from "office-ui-fabric-react/lib/Dropdown";
import firebase, { database } from "firebase"
import firebaseConfig from "./Firebase/firebase";
import Terminal from "../Images/indy_terminals.png"; 

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      camlist: [{camID:"0",mscore:1,dscore:3,noti:"yes"}], //sample formatting, erased on load
      averages: [{mavg:0,davg:0}],
      options: [{key:"test", text:"test2"}]
    };

   /* getCamData = () => {
      let ref = firebase.database().ref('Cameras'); 
      ref.on('value', snapshot => {
        const state = snapshot.val(); 
        this.setState(state);
        //selecting specific color to change map
       // colorSelection: [{red: "FF0000", yellow: "FFFF00", green: "00FF00"}]; 
  
      }); 
  
  
    } */ 

  }
async componentDidMount(){
  firebase
  .database(firebaseConfig)
  .ref("Cameras")
  .on("value", snapshot => {
    this.setState({
      camlist:[],
      averages:[], //fix this sloppy code later
      options: []
     });
     let mtotal = 0;
     let dtotal = 0;
     let iter = 0;
    snapshot.forEach((snap) => {
      iter++;
      let dbcam = {camID: snap.key, mscore: snap.val().mscore, dscore:snap.val().dscore};
      let options = {key: snap.key, text: snap.key};
      mtotal += snap.val().mscore;
      dtotal += snap.val().dscore; 
      this.setState({
        camlist:[...this.state.camlist, dbcam],
        options:[...this.state.options, options]
       }); 
    })
    this.setState({
      averages:[...this.state.averages, {mavg: mtotal/iter, davg: dtotal/iter}]
    })
  })

  //this.getCamData(); 

}

  render() {
    let {options} = this.state;

    return (
      <div>
          <Card
            className="nav"
            tokens={{ width: "75%", maxWidth: 1600, childrenGap: 5}}
            style={{
              margin: "0 auto",
              padding: "1rem",
              backgroundColor: "white",
              marginTop: "0.25rem",
            }}
          >
            DistanceMonitor
          </Card>
         
        <Fabric>
    
        <table>
             <tbody>
               <tr>
                  <td>
                  <Card
              tokens={{ width: "80%", maxWidth: 1600, childrenGap: 5 }}
              style={{
                margin: "0 13%",
                padding: "0.25rem",
                backgroundColor: "white",
              }}
            >
              <Stack horizontalAlign="left"><b>Camera Feeds</b></Stack>
              &nbsp;
              <Stack
                horizontalAlign="center"
                horizontal
                tokens={{ childrenGap: 10 }}
              >
                <Dropdown
                  placeholder="Select Camera ID"
                  options={options}
                />
                <PrimaryButton href="/local">
                  Open Local Monitor
                </PrimaryButton>
              </Stack>
              <MarqueeSelection>
                <DetailsList
                  onRenderRow={this._onRenderRow}
                  items={this.state.camlist}
                  columns={[
                    {
                        key: "column1",
                        name: "Camera ID",
                        fieldName: "camID",
                        minWidth: 50,
                        maxWidth: 100,
                        isResizable: true,
                    },
                    {
                        key: "column2",
                        name: "Mask Score",
                        fieldName: "mscore",
                        minWidth: 50,
                        maxWidth: 100,
                        isResizable: true,
                    },
                    {
                        key: "column3",
                        name: "Distancing Score",
                        fieldName: "dscore",
                        minWidth: 50,
                        maxWidth: 100,
                        isResizable: true,
                    },
                    {
                        key: "column4",
                        name: "Notifications",
                        fieldName: "noti",
                        minWidth: 50,
                        maxWidth: 100,
                        isResizable: true,
                    }
                  ]}
                  styles={{ root: { height: "100%" } }}
                  selectionPreservedOnEmptyClick={true}
                  layoutMode={DetailsListLayoutMode.justified}
                  enableUpdateAnimations
                />
              </MarqueeSelection>
            </Card>
                  </td>


                  <td rowSpan = "3" className = "mapCol">
                  <Card tokens={{ width: "80%", maxWidth: 1600, childrenGap: 5}}
              style={{
                margin: "1% 9.5%",
                padding: "1rem",
                backgroundColor: "white",
              }}>
               

                <Stack>

                  <div className = "base_wrap">
                  <img id = "terminal" src = {Terminal} alt = "Indianapolis Airport: Concourse A and B" /> 
                  
                  <svg id = "terminalMap" viewBox="0 0 521 665" preserveAspectRatio="xMinYMax">
                    <path id = "arrivalLevel1" className = "red" area-color = "FF0000" d = "M58 482 L81 461 L123 508 L105 529 L58 482 Z" strokeWidth = "2" stroke = "green"/>
                    <path id = "arrivalLevel2" className = "yellow" area-color = "FFFF00" d = "M81 461 L112 434 L150 472 L123 508 L81 461 Z" strokeWidth = "2" stroke = "green"/>
                    <path id = "arrivalLevel3" className = "green" area-color = "00FF00" d = "M150 472 L123 508 L163 543 L190 512 L187 537 L187 537 L212 528 L227 537 L245 518 L197 473 L165 486 L150 472 Z" strokeWidth = "2" stroke = "green"/>
                    <path id = "arrivalLevel4" className = "yellow" area-color = "FFFF00" d = "M123 508 L163 543 L147 562 L105 528 Z" strokeWidth = "2" stroke = "green"/>
                    <path id = "conB3-B5" className = "green" area-color = "00FF00" d = "M31 245 L34 263 L34 284 L86 288 L116 235 L89 219 C89,219 70,239 31,245 Z" strokeWidth = "2" stroke = "green"/>
                    <path id = "conB5-B10" className = "yellow" area-color = "FFFF00" d = "M116 235 L89 219 L133 164 L156 184 L116 235 Z" strokeWidth = "2" stroke = "green"/>
                    <path id = "conB10-B17" className = "red" area-color = "FF0000" d = "M133 164 L156 184 L205 122 L179 104 Z" strokeWidth = "2" stroke = "green"/>
                    <path id = "conB17-B25" className = "green" area-color = "00FF00" d = "M205 122 L179 104 L223 54 L245 72 Z" strokeWidth = "2" stroke = "green"/>
                    <path id = "interTerminal1" className = "green" area-color = "00FF00" d = "M86 288 L93 296 C93,296 67,305 50,320 C50,320 67,356 94,388 C94,388 127,412 165,425 C169,425 182,408 187,392 L192,382 L93,296 Z" strokeWidth = "2" stroke = "green"/>
                    <path id = "interTerminal2" className = "red" area-color = "FF0000" d = "M116 235 L181 294 L144,342 L86,288 Z" strokeWidth = "2" stroke = "green"/>
                    <path id = "interTerminal3" className = "yellow" area-color = "FFFF00" d = "M181 294 L144 342 L223 411 L228 453 L243 451 C243,451 246,416 271,386 L181,294 Z" strokeWidth = "2" stroke = "green"/>
                    <path id = "conA5-A13" className = "red" area-color = "FF0000" d = "M271 386 L255 366 L326 306 L344 327 Z" strokeWidth = "2" stroke = "green"/>
                    <path id = "conA13-A17" className = "yellow" area-color = "FFFF00" d = "M326 306 L344 327 L384 292 L367 270 Z" strokeWidth = "2" stroke = "green"/>
                    <path id = "conA17-A25" className = "green" area-color = "00FF00" d = "M384 292 L367 270 L412 237 L426 256 Z" strokeWidth = "2" stroke = "green"/>
                  </svg>
                  
                  </div>

                </Stack>
            </Card>   
                  </td>
               </tr>

               <tr>
                  <td>
                  <Card tokens={{ width: "80%", maxWidth: 1600, childrenGap: 5 }}
              style={{
                margin: "0 13%",
                padding: "1rem",
                backgroundColor: "white",
              }}>
            <Stack horizontalAlign="left"><b>Average Values</b></Stack>
            <DetailsList
                  onRenderRow={this._onRenderRow}
                  items={this.state.averages}
                  columns={[
                    {
                        key: "column1",
                        name: "Mask Average",
                        fieldName: "mavg",
                        minWidth: 50,
                        maxWidth: 100,
                        isResizable: true,
                    },
                    {
                        key: "column2",
                        name: "Distancing Average",
                        fieldName: "davg",
                        minWidth: 50,
                        maxWidth: 100,
                        isResizable: true,
                    },
                  ]}
                  styles={{ root: { height: "100%" } }}
                  selectionPreservedOnEmptyClick={true}
                  layoutMode={DetailsListLayoutMode.justified}
                  enableUpdateAnimations
                />
            </Card>
                  </td>
               </tr>

               <tr>
                  <td>
                        <Card tokens = {{width: "80%", maxWidth: 1600, childrenGap: 5}}
                            style = {{
                            margin: "0 13%",
                            padding: "1rem",
                            backgroundColor: "white"
                          }}>

                          <Stack>Terminal Map Key</Stack>
                          <Stack>
                              const CheckboxBasicExample: React.FunctionComponent = () =>{
                              return(
                                <table>
                                    <tbody>
                                      <tr>
                                        <td>
                                          <Checkbox label = "Red - Severe Risk" divAssoc = "FF0000" onChange = {this._mapChange} />
                                        </td>

                                        <td>
                                          <Checkbox label = "Yellow - Moderate Risk" divAssoc = "FFFF00" onChange = {_mapChange} />
                                        </td>

                                        <td>
                                          <Checkbox label = "Green - Miniscule Risk" divAssoc = "00FF00" onChange = {_mapChange} /> 
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                              )
                            }
                          </Stack>
                        </Card>
                  </td>
                </tr>

             </tbody>
           </table>
          
        </Fabric>
          </div>


        

       /* <div className = "mainBox">
          <div className = "row1col1">
          
          </div>
          <div className = "row1col2">
                  
          </div>
          <div className = "row2col1">
          
          </div>
        </div> */
          
        
         /*</div> <div>
            <br />
         </div> */

        
    
    );
  }


  _onRenderRow = (props) => {
    const customStyles = {};
    if (props) {
      if (props.itemIndex % 2 === 0) {
        // Every other row renders with a different background color
        customStyles.root = { backgroundColor: "#DEF2FF" };
      }
      return <DetailsRow {...props} styles={customStyles} />;
    }
    return null;
  };


  _mapChange(ev: React.FormEvent<HTMLElement>, isChecked: boolean)
  {
    let checkColor = ev.target; 
    let valColor = checkColor.getAttribute("divAssoc");
   // console.log(valColor); 
    let totalMap = document.getElementById("terminalMap").querySelectorAll("path"); 

    for(this.maps in totalMap)
    {
      let pathColor = totalMap[this.maps].getAttribute("area-color");

      if (valColor == pathColor)
      {
       let  newPathColor = totalMap[this.maps].style.fill.value = valColor;
      }
      else
      {
        break; 
      }
    }
      

    
    
      /*  if(valColor == "FF0000")
        {
            
        }

        else if(valColor == "FF0000" and valColor == "FFFF00")
        {

        }
        else if(valColor == "FF0000" and valColor == "00FF00")
        {

        }
        else if(valColor == "FFFF00")
        {

        }
        else if(valColor == "FFFF00"  and valColor == "00FF00")
        {

        }
        else if(valColor == "00FF00")
        {

        }
        else if(valColor =="FF0000" and valColor == "FFFF00" and valColor == "00FF00")
        {

        }
*/

          
          }

    
   
}
export default Home
