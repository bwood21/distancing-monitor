import React, { Component } from "react";
import 'office-ui-fabric-react/dist/css/fabric.css';
import { PrimaryButton } from "office-ui-fabric-react";
import { Card } from "@uifabric/react-cards";
import { Stack } from "office-ui-fabric-react/lib/Stack";
import { MarqueeSelection } from "office-ui-fabric-react/lib/MarqueeSelection";
import {
  DetailsList,
  DetailsListLayoutMode,
  Selection,
  SelectionMode
} from "office-ui-fabric-react/lib/DetailsList";
import { Fabric } from "office-ui-fabric-react/lib/Fabric";
import { DetailsRow } from "office-ui-fabric-react/lib/DetailsList";
import {
  Dropdown
} from "office-ui-fabric-react/lib/Dropdown";
import firebase, { database } from "firebase"
import firebaseConfig from "./Firebase/firebase";
import { Player } from 'video-react'
import "../../node_modules/video-react/dist/video-react.css";
import Terminal from "../Images/indy_terminals.png";
import ControlBar from "video-react/lib/components/control-bar/ControlBar";
let localmonitorpath = "/local/";
const timeinterval = 3000 //milliseconds
const numinterval = 5
class Home extends Component {
  constructor(props) {
    super(props);
    /*     this._selection = new Selection({
          onSelectionChanged: () =>
            this.setState({ selected_url: this._getselected_url() }),
        }); */

    this.state = {
      camlist: [{ camID: "0", mscore: [], dscore: [], pscore: [], url: "" }], //sample formatting, erased on load
      displaylist: [{ camID: "0", mscore: 0, dscore: 0, pscore: 0, url: "" }],
      averages: [{ mavg: 0, davg: 0, pavg: 0 }],
      options: [{ key: "test", text: "test2" }],
      mapareas: [{ camID: 1, safescore: 1, areaColor: "green" }],
      vidurl: "",
      //selected_url: this._getselected_url(),
      seconds: 0,
      new_url: "",
      currentlyselected: ""
    };

  }
  async componentDidMount() {
    firebase
      .database(firebaseConfig)
      .ref()
      .orderByKey()
      .limitToLast(1)
      .on("value", snapshot => {
        this.setState({
          camlist: [],
          averages: [], //TODO: fix this sloppy code later
          options: [],
          mapareas: [],
          displaylist: []
        });
        let mtotal = 0;
        let dtotal = 0;
        let ptotal = 0;
        let iter = 0;
        let log = snapshot.child(snapshot.node_.children_.root_.key + "/Cameras") //this doesn't seem like the right way to do this but oh well
        log.forEach((snap) => { //For each camera
          iter++;
          let dbcam = { camID: snap.key, mscore: snap.val().mscore, dscore: snap.val().dscore, pscore: snap.val().pscore, url: snap.val().url };
          let initialvals = { camID: snap.key, mscore: snap.val().mscore[0], dscore: snap.val().dscore[0], pscore: snap.val().pscore[0], url: snap.val().url };
          let options = { key: snap.key, text: snap.key };
          let initialsafescore = (snap.val().mscore[0] + snap.val().dscore[0]) / snap.val().pscore[0];
          let areaColor = this.setMap(initialsafescore)
          let areascore = { camID: snap.key, safescore: initialsafescore, areaColor: areaColor }; //TODO : remove safescore?
          mtotal += snap.val().mscore[0];
          dtotal += snap.val().dscore[0];
          ptotal += snap.val().pscore[0];
          this.setState({
            camlist: [...this.state.camlist, dbcam],
            options: [...this.state.options, options],
            mapareas: [...this.state.mapareas, areascore],
            displaylist: [...this.state.displaylist, initialvals]
          });
        })
        this.setState({
          averages: [...this.state.averages, { mavg: Math.round(mtotal / iter), davg: Math.round(dtotal / iter), pavg: Math.round(ptotal / iter) }]
        })
      })
  }

  setMap(safescore) {
    let areaColor = ""
    if (safescore <= 1.5) {
      //fill color would be green
      areaColor = "red";
    }
    else if (safescore > 1.5 && safescore <= 1.8) {
      //fill color would be yellow
      areaColor = "yellow";
    }
    else if (safescore < 1.8 && safescore <= 2.1) { //should never be above 2
      //fill color would be red 
      areaColor = "red";
    }
    return areaColor
  }

  setScores(camera) {

    let cams = [...this.state.camlist]
    let camarrays = { ...cams[camera] }

    let items = [...this.state.displaylist]
    let item = { ...items[camera] }

    item.mscore = camarrays.mscore[this.state.seconds] //setting new values
    item.pscore = camarrays.pscore[this.state.seconds]
    item.dscore = camarrays.dscore[this.state.seconds]
    items[camera] = item //put item back
    let mapIndex = this.state.mapareas.findIndex((obj => obj.camID === this.state.camlist[camera].camID));
    if(mapIndex < 0){
      alert("Map area not found")
    }
    let maps = [...this.state.mapareas]
    let map = { ...maps[mapIndex] }

    let score = (item.mscore + item.dscore) / item.pscore; //Mask usage needs to be 80%, distancing 80% so score needs to be greater than 1.8
    map.safescore = score
    map.areaColor = this.setMap(score)
    maps[mapIndex] = map
    let iter = 0;
    let mavg = 0;
    let davg = 0;
    let pavg = 0;
    this.state.displaylist.forEach(element => {
      iter++;
      mavg += element.mscore
      davg += element.dscore
      pavg += element.pscore
    });
    this.setState({
      averages: [{ mavg: Math.round(mavg / iter), davg: Math.round(davg / iter), pavg: Math.round(pavg / iter) }]
    })
    this.setState({ displaylist: items, mapareas: maps }) //replace items
  }

  StartTimer(camera) { //poor mans video sync
    let interval = null;

    interval = setInterval(() => {
      this.setState({ seconds: this.state.seconds + 1 })
      if (this.state.seconds > numinterval) {
        this.resetPlayback()
        clearInterval(interval)
      } else {
        firebase
          .database(firebaseConfig)
          .ref()
          .orderByKey()
          .limitToLast(1)
          .once("value", snapshot => {
            let timestamp = snapshot.child(snapshot.node_.children_.root_.key)
            let cameras = timestamp.child(timestamp.node_.children_.root_.key)
            let cam = cameras.child(this.state.currentlyselected)
            cam.ref.child("Active").set(true)
          })

        this.setScores(camera);
      }
    }, timeinterval);
    return () => clearInterval(interval);
  }

  resetPlayback() {
    this.setState({ seconds: 0 })
    firebase
      .database(firebaseConfig)
      .ref()
      .orderByKey()
      .limitToLast(1)
      .once("value", snapshot => {
        let timestamp = snapshot.child(snapshot.node_.children_.root_.key)
        let cameras = timestamp.child(timestamp.node_.children_.root_.key)
        let cam = cameras.child(this.state.currentlyselected)
        cam.ref.child("Active").set(false)
      })
  }

  render() {
    let { options, seconds } = this.state;
    return (
      <div className = "totalWrap">
        <Card
          className="nav"
          tokens={{ width: "77%", maxWidth: 1600, childrenGap: 5 }}
          style={{
            margin: "0 auto",
            padding: "1rem",
            backgroundColor: "white",
            marginTop: "2rem",
          }}
        >
          SentrySight Dashboard
        </Card>
          &nbsp;
        <div>
          <br />
        </div>
        <div style={{ display: "inline-block" }}>
          <Player
            playsInline
            fluid={false}
            width={1000}
            height={500}
            autoPlay={true}
            src={this.state.new_url}
          ><ControlBar disableCompletely={true}/></Player>
        </div>
        &nbsp;

        <br />

        <div style={{ display: "inline-block" }}>
          {/*<Player
            playsInline
            fluid={false}
            width={1000}
            height={500}
            poster="../Images/mask_green.png"
            src={this.state.vidurl}
          /> */}
        </div>

        <Fabric>

          <table>
            <tbody>
              <tr>
                <td>
                  <Card
                    tokens={{ width: "90%", maxWidth: 1600, childrenGap: 5 }}
                    style={{
                      margin: "-2% 13%",
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
                        onChange={(e, selectedOption) => {
                          localmonitorpath = "/local/" + selectedOption.key
                          let index = this.state.camlist.findIndex((obj => obj.camID === selectedOption.key));
                          this.setState({ currentlyselected: selectedOption.key })
                          this.setState({ new_url: this.state.camlist[index].url })
                          this.StartTimer(index)
                        }}
                      />
                      <PrimaryButton onClick={(e) => { //Must use onClick instead of href because href only runs once on initialization
                        e.preventDefault()
                        window.location.href = localmonitorpath
                      }}>
                        Open Local Monitor
                </PrimaryButton>
                    </Stack>
                    <MarqueeSelection>
                      <DetailsList
                        onRenderRow={this._onRenderRow}
                        items={this.state.displaylist}
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
                            name: "Population",
                            fieldName: "pscore",
                            minWidth: 50,
                            maxWidth: 100,
                            isResizable: true,
                          }
                        ]}
                        styles={{ root: { height: "100%" } }}
                        selectionPreservedOnEmptyClick={true}
                        layoutMode={DetailsListLayoutMode.justified}
                        selectionMode={SelectionMode.single}
                        selection={this._selection}
                        enableUpdateAnimations
                      />
                    </MarqueeSelection>
                  </Card>
                </td>


                <td rowSpan="2" className="mapCol">
                  <Card tokens={{ width: "80%", maxWidth: 1600, childrenGap: 5 }}
                    style={{
                      margin: "1% 9.5%",
                      padding: "1rem",
                      backgroundColor: "white",
                    }}>

                    <Stack>
                      {/*placement incorrect or html interfering with code working? */}
                      <div className="base_wrap">
                        <img id="terminal" src={Terminal} alt="Indianapolis Airport: Concourse A and B" />

                        <svg id="terminalMap" viewBox="0 0 521 665" preserveAspectRatio="xMinYMax">
                          <path id="arrivalLevel1" className={this.state.mapareas[0] ? this.state.mapareas[0].areaColor : "grey"} area-color="FF0000" d="M58 482 L81 461 L123 508 L105 529 L58 482 Z" strokeWidth="2" stroke="green" />
                          <path id="arrivalLevel2" className={this.state.mapareas[1] ? this.state.mapareas[1].areaColor : "grey"} area-color="FFFF00" d="M81 461 L112 434 L150 472 L123 508 L81 461 Z" strokeWidth="2" stroke="green" />
                          <path id="arrivalLevel3" className={this.state.mapareas[2] ? this.state.mapareas[2].areaColor : "grey"} area-color="00FF00" d="M150 472 L123 508 L163 543 L190 512 L187 537 L187 537 L212 528 L227 537 L245 518 L197 473 L165 486 L150 472 Z" strokeWidth="2" stroke="green" />
                          <path id="arrivalLevel4" className={this.state.mapareas[3] ? this.state.mapareas[3].areaColor : "grey"} area-color="FFFF00" d="M123 508 L163 543 L147 562 L105 528 Z" strokeWidth="2" stroke="green" />
                          <path id="conB3-B5" className={this.state.mapareas[4] ? this.state.mapareas[4].areaColor : "grey"} area-color="00FF00" d="M31 245 L34 263 L34 284 L86 288 L116 235 L89 219 C89,219 70,239 31,245 Z" strokeWidth="2" stroke="green" />
                          <path id="conB5-B10" className={this.state.mapareas[5] ? this.state.mapareas[5].areaColor : "grey"} area-color="FFFF00" d="M116 235 L89 219 L133 164 L156 184 L116 235 Z" strokeWidth="2" stroke="green" />
                          <path id="conB10-B17" className={this.state.mapareas[6] ? this.state.mapareas[6].areaColor : "grey"} area-color="FF0000" d="M133 164 L156 184 L205 122 L179 104 Z" strokeWidth="2" stroke="green" />
                          <path id="conB17-B25" className={this.state.mapareas[7] ? this.state.mapareas[7].areaColor : "grey"} area-color="00FF00" d="M205 122 L179 104 L223 54 L245 72 Z" strokeWidth="2" stroke="green" />
                          <path id="interTerminal1" className={this.state.mapareas[8] ? this.state.mapareas[8].areaColor : "grey"} area-color="00FF00" d="M86 288 L93 296 C93,296 67,305 50,320 C50,320 67,356 94,388 C94,388 127,412 165,425 C169,425 182,408 187,392 L192,382 L93,296 Z" strokeWidth="2" stroke="green" />
                          <path id="interTerminal2" className={this.state.mapareas[9] ? this.state.mapareas[9].areaColor : "grey"} area-color="FF0000" d="M116 235 L181 294 L144,342 L86,288 Z" strokeWidth="2" stroke="green" /> }
                    {/*Extra paths will be turned grey.  */}
                          <path id="interTerminal3" className="grey" area-color="FFFF00" d="M181 294 L144 342 L223 411 L228 453 L243 451 C243,451 246,416 271,386 L181,294 Z" strokeWidth="2" stroke="green" />
                          <path id="conA5-A13" className="grey" area-color="FF0000" d="M271 386 L255 366 L326 306 L344 327 Z" strokeWidth="2" stroke="green" />
                          <path id="conA13-A17" className="grey" area-color="FFFF00" d="M326 306 L344 327 L384 292 L367 270 Z" strokeWidth="2" stroke="green" />
                          <path id="conA17-A25" className="grey" area-color="00FF00" d="M384 292 L367 270 L412 237 L426 256 Z" strokeWidth="2" stroke="green" /> }
                  </svg>

                      </div>

                    </Stack>
                  </Card>
                </td>
              </tr>

              <tr>
                <td>
                  <Card tokens={{ width: "90%", maxWidth: 1600, childrenGap: 5 }}
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
                        {
                          key: "column3",
                          name: "People Average",
                          fieldName: "pavg",
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
                  </Card>
                </td>
              </tr>

            </tbody>
          </table>

        </Fabric>
      </div>
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


  _mapChange(ev: React.FormEvent<HTMLElement>, isChecked: boolean) {
    let checkColor = ev.target;
    let valColor = checkColor.getAttribute("divAssoc");
    // console.log(valColor); 
    let totalMap = document.getElementById("terminalMap").querySelectorAll("path");

    for (this.maps in totalMap) {
      let pathColor = totalMap[this.maps].getAttribute("area-color");

      if (valColor == pathColor) {
        let newPathColor = totalMap[this.maps].style.fill.value = valColor;
      }
      else {
        break;
      }
    }

  }



}
export default Home
