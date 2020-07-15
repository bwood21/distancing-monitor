import React, { Component } from "react";
import { PrimaryButton } from "office-ui-fabric-react";
import { Card } from "@uifabric/react-cards";
import { Stack } from "office-ui-fabric-react/lib/Stack";
import { TextField } from "office-ui-fabric-react/lib/TextField";
import { MarqueeSelection } from "office-ui-fabric-react/lib/MarqueeSelection";
import {
  DetailsList,
  DetailsListLayoutMode,
} from "office-ui-fabric-react/lib/DetailsList";
import { Fabric } from "office-ui-fabric-react/lib/Fabric";
import { DetailsRow } from "office-ui-fabric-react/lib/DetailsList";
import {
  Dropdown
} from "office-ui-fabric-react/lib/Dropdown";
import firebase, { database } from "firebase"
import firebaseConfig from "./Firebase/firebase";
import {Link} from 'react-router-dom'
//TODO: database Auth
let localmonitorpath = "/local/";
class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      camlist: [{camID:"0",mscore:1,dscore:3,noti:"yes"}], //sample formatting, erased on load
      averages: [{mavg:0,davg:0}],
      options: [{key:"test", text:"test2"}]
    };
  }
async componentDidMount(){
  firebase
  .database(firebaseConfig)
  .ref("Cameras")
  .on("value", snapshot => {
    this.setState({
      camlist:[],
      averages:[], //TODO: fix this sloppy code later
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
}

  render() {
    let {options} = this.state;
    return (
      <div>
          <Card
            className="nav"
            tokens={{ width: "60%", maxWidth: 1600, childrenGap: 5 }}
            style={{
              margin: "0 auto",
              padding: "1rem",
              backgroundColor: "white",
              marginTop: "2rem",
            }}
          >
            DistanceMonitor
          </Card>
          &nbsp;
          <div>
            <br />
          </div>
        &nbsp;
          <Fabric>
            <Card
              tokens={{ width: "75%", maxWidth: 1600, childrenGap: 5 }}
              style={{
                margin: "0 auto",
                padding: "1rem",
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
                    console.log(localmonitorpath)
                  }}
                />
                <PrimaryButton onClick={(e) => { //Must use onClick instead of href because href only runs once on initialization
                  e.preventDefault()
                  window.location.href=localmonitorpath
                }}>
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

          <div>
            <br />
          </div>

            <Card tokens={{ width: "75%", maxWidth: 1600, childrenGap: 5 }}
              style={{
                margin: "0 auto",
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
}
export default Home
