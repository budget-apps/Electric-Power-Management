import React, { Component } from 'react';
import Header from '../Header/Header'
import SideMenu from '../SideMenu/SideMenu'
import Map from '../Map/Map'
import Path from '../Path/Path'
import AddExelSheet from '../Button/AddExelSheet'
import AddFaults from '../Button/AddFaults'
import SelectMap from '../Button/SelectMap'
import FaultPath from '../FaultEdge/FaultEdge'

import FaultEdge from '../FaultEdge/FaultEdge'
import Graph from '../Graph/Graph'
import Node from '../Node/Node'
import './Dashboard.css'

var firebase = require("firebase");

class Dashboard extends Component {



    state = {
        electricMap:[],
        graph: new Graph(),
        nodeDataArray: [
            { key: "1", text: "Start","loc": "-600 0"},
            { key: 2, text: "345\nPrimary","loc": "-500 -100"},
            { key: 4, text: "247\nSwitch\nClosed","loc": "-300 -100"},
            { key: 5, text: "248\nSwitch\nClosed","loc": "-100 -100"},
            { key: 3, text: "346\nPrimary","loc": "-500 100"},
            { key: 6, text: "249\nSwitch\nClosed","loc": "100 -100"},
            { key: 7, text: "250\nSwitch\nClosed","loc": "-300 100"},
            { key: 8, text: "End","loc": "200 0"},
        ],
        linkDataArray: [
            { "from": "1", "to": 2, "text": "Capacity"},
            { "from": 1, "to": 3, "text": "Capacity"},
            { "from": 2, "to": 4, "text": "Capacity",},
            { "from": 4, "to": 5, "text": "Capacity"},
            { "from": 5, "to": 6, "text": "Capacity" },
            { "from": 4, "to": 7, "text": "Capacity" },
            { "from": 6, "to": 8, "text": "Capacity" },
            { "from": 7, "to": 8, "text": "Capacity" },
        ],
    }

    generateGraph(){
        const start=new Node(0)
        const end=new Node(251)
        const graph = new Graph(start)

        const map = this.state.electricMap
        let dataLength = this.state.electricMap.length;
        let nodeArray=[]
        for(let i=0;i<dataLength;i++){
            let nodeData = map[i];
            let tempNode = new Node(nodeData.id)
            tempNode.setCurrentPower(nodeData.currentPower)
            tempNode.setNodeType(nodeData.type)
            tempNode.setBranch(nodeData.branch)
            tempNode.setCapacity(nodeData.capacity)
            tempNode.setIsTripped(nodeData.isTripped)
            tempNode.setFaultCurrent(nodeData.faultCurrent)
            tempNode.setSwitchType(nodeData.switchType)
            nodeArray.push(tempNode)
        }
        graph.addVertertices(nodeArray)
        this.setState({
            graph: graph
        })
        console.log(this.state.graph)
    }
    generateNodeDataArray(){
        this.setState({
            nodeDataArray: [
                { key: "1", text: "Start","loc": "-600 0"},
                { key: 2, text: "345\nPrimary","loc": "-500 -100"},
                { key: 4, text: "247\nSwitch\nClosed","loc": "-300 -100"},
                { key: 5, text: "248\nSwitch\nClosed","loc": "-100 -100"},
                { key: 3, text: "346\nPrimary","loc": "-500 100"},
                { key: 6, text: "249\nSwitch\nClosed","loc": "100 -100"},
                { key: 7, text: "250\nSwitch\nClosed","loc": "-300 100"},
                { key: 8, text: "End","loc": "200 0"},
            ]
        })
        console.log(this.state.nodeDataArray)
    }

    generateLinkDataArray(){
        this.setState({
            linkDataArray: [
                { "from": "1", "to": 2, "text": "Capacity"},
                { "from": 1, "to": 3, "text": "Capacity"},
                { "from": 2, "to": 4, "text": "Capacity",},
                { "from": 4, "to": 5, "text": "Capacity"},
                { "from": 5, "to": 6, "text": "Capacity" },
                { "from": 4, "to": 7, "text": "Capacity" },
                { "from": 6, "to": 8, "text": "Capacity" },
                { "from": 7, "to": 8, "text": "Capacity" },
            ]
        })
    }

    selectMapEventHandler=(event)=>{

        console.log(event.target.value)
        firebase.database().ref().child('electricMap').orderByChild('1/branch').equalTo(event.target.value)
        .once('value')
        
        .then((snapshot) => {
            const key = snapshot.key;
            const val = snapshot.val().electricmap;
            this.setState({electricMap:val})
            console.log(this.state.electricMap[0])
            this.generateGraph()
            this.generateLinkDataArray()
            this.generateNodeDataArray()
        })
        .catch((e) => {
            alert("nothing found")
        });

    }

    render() {
        const {electricmap} = this.props
        return (
            <div className="d-flex" id="wrapper">
                <SideMenu/>
                <div id="page-content-wrapper" style={{padding: "0"}}>

                    <Header/>
                    <div className="row" style={{padding: "0", margin: 0, width: "100%"}}>

                        <div className="col-md-3">
                            <AddExelSheet/>
                        </div>
                        <div className="col-md-3">
                            {/*<AddFaults/>*/}
                        </div>
                        <div className="col-md-3">

                        </div>
                        <div className="col-md-3">
                        <SelectMap changed={this.selectMapEventHandler}/>
                        {/*<select class="browser-default custom-select" onChange={this.selectMapEventHandler}>*/}
                        {/*<option selected> select branch</option>*/}
                        {/*<option value="Negambo">Negambo</option>*/}
                        {/*</select>*/}

                        </div>


                    </div>
                    <div className="row">
                        <div className="col-md-9" style={{width: "100%"}}>
                            <Map dataNodes={this.state.nodeDataArray} dataLinks={this.state.linkDataArray}/>
                        </div>
                        <div className="col-md-3">
                            <FaultEdge changed={this.faultSwitchInputHandler} graph={this.state.graph}/>
                            <Path/>
                        </div>
                    </div>
                </div>

            </div>
        );
    }

}
export default Dashboard
