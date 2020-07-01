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

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      itemlist: [{camID:"Cam01",mscore:1,dscore:3,noti:"yes"},{camID:"Cam02",mscore:1,dscore:3,noti:"yes"},{camID:"Cam03",mscore:1,dscore:3,noti:"yes"}],
    };

  }
  render() {

    const {
      itemlist
    } = this.state;

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
            Welcome to DistanceMonitor
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
                <TextField
                  placeholder="Test"
                  styles={{ root: { width: 400 } }}
                  id="ColName"
                />
                <Dropdown
                  placeholder="Test"
                />
                <PrimaryButton>
                  SampleButton
                </PrimaryButton>
              </Stack>
              <MarqueeSelection>
                <DetailsList
                  onRenderRow={this._onRenderRow}
                  items={itemlist}
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
