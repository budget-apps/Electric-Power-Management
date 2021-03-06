import React, { Component } from 'react';
import Header from '../Header/Header'
import SideMenu from '../SideMenu/SideMenu'
import Map from '../Map/Map'
import Path from '../Path/Path'
import AddExelSheet from '../Button/AddExelSheet'
import SelectMap from '../Button/SelectMap'

import FaultEdge from '../FaultEdge/FaultEdge'
import Graph from '../Graph/Graph'
import Node from '../Node/Node'
import './Dashboard.css'
import UpdateComponent from '../UpdateMaps/UpdateMap'
import Swal from "sweetalert2";

var firebase = require("firebase");

class Dashboard extends Component {
    state = {
        electricMap:[],
        graph: new Graph(),
        branch: "No Branch",
        nodeDataArray: [],
        linkDataArray: [],
        faultNodeArray: [],
        faultLinkArray: [],
        pathNodeArray: [],
        pathLinkArray: [],
        faultEdges: [],
        paths: [],
        isSelect: false,
        faultSwitch: "",
        show:false,
        hasFaults: false,
    }

    /*Find recovery paths*/
    findFaultPaths(){
        let graph=this.state.graph;
        //let faultEdges = graph.findFaultEdge(faultLoc)
        let faultEdges = this.state.faultEdges
        //console.log(faultEdges)

        let paths = graph.findAltPaths(faultEdges)

        this.setState({
            paths: paths,
        })
        //console.log(paths)
        let allPathNodeData = []
        let allPathLinkData = []
        for(let i=0;i<paths.length;i++){
            let pathNodeSet = []
            let pathLinkSet = []
            let locX = -100
            let locY= 0
            for(let j=0;j<paths[i].length;j++){
                let tempNode = paths[i][j]
                let nodeID= tempNode.getNodeId()
                let nodeType= tempNode.getNodeType()
                let switchType = tempNode.getSwitchType()
                let text = "ID: "+nodeID+"\nType: "+nodeType+"\nStatus: "+switchType
                let pathNodeDataRow = {key: nodeID,text: text,"loc": locX+" "+locY}
                locX+=200;
                pathNodeSet.push(pathNodeDataRow)
                let pathNodeLinkRow= {}
                if(j!==paths[i].length-1){
                    let lineCapacity = paths[i][j].getLineCurrent(paths[i][j+1])
                    let lineLength = paths[i][j].getLineLength(paths[i][j+1])
                    let lineConduct = paths[i][j].getLineConductivity(paths[i][j+1])
                    let text2 = "Current power: "+lineCapacity+"\nLength: "+lineLength+"\nCapacity: "+lineConduct
                    pathNodeLinkRow = {"from": paths[i][j].getNodeId(),"to": paths[i][j+1].getNodeId(),"text": text2}
                }
                pathLinkSet.push(pathNodeLinkRow)
            }
            allPathNodeData.push(pathNodeSet)
            allPathLinkData.push(pathLinkSet)
        }
        this.setState({
            pathNodeArray: allPathNodeData,
            pathLinkArray: allPathLinkData
        })
    }

    /*Find fault edges*/
    findFaultEdges(){
        //console.log(this.state.graph)
        let graph=this.state.graph;
        let faultLoc = this.state.faultSwitch
        let faultEdges = graph.getAllPathsTo(faultLoc);

        let allPathNodeData = []
        let allPathLinkData = []
        for(let i=0;i<faultEdges.length;i++){
            let pathNodeSet = []
            let pathLinkSet = []
            let locX = -100
            let locY= 0
            for(let j=0;j<faultEdges[i].length;j++){
                let tempNode = faultEdges[i][j]
                let nodeID= tempNode.getNodeId()
                let nodeType= tempNode.getNodeType()
                let switchType = tempNode.getSwitchType()
                let text = "ID: "+nodeID+"\nType: "+nodeType+"\nStatus: "+switchType
                let pathNodeDataRow = {key: nodeID,text: text,"loc": locX+" "+locY}
                locX+=200;
                pathNodeSet.push(pathNodeDataRow)
                let pathNodeLinkRow= {}
                if(j!==faultEdges[i].length-1){
                    let lineCapacity = faultEdges[i][j].getLineCurrent(faultEdges[i][j+1])
                    let lineLength = faultEdges[i][j].getLineLength(faultEdges[i][j+1])
                    let lineConduct = faultEdges[i][j].getLineConductivity(faultEdges[i][j+1])
                    let text2 = "Current power: "+lineCapacity+"\nLength: "+lineLength+"\nCapacity: "+lineConduct
                    pathNodeLinkRow = {"from": faultEdges[i][j].getNodeId(),"to": faultEdges[i][j+1].getNodeId(),"text": text2}
                }
                pathLinkSet.push(pathNodeLinkRow)
            }
            allPathNodeData.push(pathNodeSet)
            allPathLinkData.push(pathLinkSet)
        }
        this.setState({
            faultEdges: faultEdges,
            faultNodeArray: allPathNodeData,
            faultLinkArray: allPathLinkData,
        })
        //console.log(this.state.faultNodeArray)
        //console.log(this.state.faultLinkArray)
    }

    /*Generate graph from db data*/
    generateGraph(){
        const start=new Node(0)
        start.setNodeType("Start")
        //const end = new Node(-5)

        const graph = new Graph(start)

        const map = this.state.electricMap
        //console.log(map)
        let dataLength = this.state.electricMap.length;
        let nodeArray=[]
        for(let i=0;i<dataLength;i++){
            let nodeData = map[i];
            //console.log(nodeData)
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
        //nodeArray.push(end)
        graph.addVertertices(nodeArray)
        let allPrimarys = graph.findPrimary();
        for(let i=0;i<allPrimarys.length;i++){
            start.setAdjacent(allPrimarys[i],0)
        }
        //console.log(graph)

        let allVertices=graph.getVertices()
        for(let i=0;i<dataLength;i++){
            let nodeData = map[i]
            let nodeAdjacents = "["+nodeData.adjecent+"]"
            let nodesJson = JSON.parse(nodeAdjacents)
            //console.log(nodesJson)
            let vertex = allVertices[i+1];
            for(let j=0;j<nodesJson.length;j++){
                let nodeID=nodesJson[j][0]
                let nodeWeight = Number(nodesJson[j][1])
                let nodeLength = Number(nodesJson[j][2])
                let nodeConductivity = Number(nodesJson[j][3])
                let node = graph.getVertex(nodeID)
                if(node!==undefined && nodeWeight!==NaN){
                    if(nodeID!==-2){
                        if(vertex.getNodeType()==="Start"){
                            vertex.setAdjacent(node,0,0,0)
                        }
                        vertex.setAdjacent(node,nodeWeight,nodeLength,nodeConductivity)
                    }

                    //console.log(vertex.getNodeId()+","+node.getNodeId())
                }

            }
        }
        this.setState({
            graph: graph
        })
        //console.log(graph,this.state.graph)
    }

    /*Generate maps nodes objects and nodes places*/
    generateNodeDataArray(){
        let allVertices = this.state.graph.getVertices();
        let nodeData=[];
        let placex = -400;
        let placey = 100;
        let isPrimary = true;
        let isNormal = true;
        for(let i=0; i<allVertices.length;i++){
            let tempNode = allVertices[i];
            let nodeID= tempNode.getNodeId()
            let nodeType= tempNode.getNodeType()
            let switchType = tempNode.getSwitchType()
            let isTripped = tempNode.getIsTripped()
            let faultCurrent = tempNode.getFaultCurrent()
            let currentPower = tempNode.getCurrentPower()
            let capacity = tempNode.getCapacity()
            if(!(nodeType==="Start" || nodeType==="End" || nodeType==="Primary")){
                if(tempNode.getNodeId()===2){
                    let locXY="-100 -240"
                    let text = "ID: "+nodeID+"\nType: "+nodeType+"\nStatus: "+switchType+"\nisTipped: "+isTripped+"\nFault Current: "+faultCurrent+"\nCurrent Power: "+currentPower
                    let nodeDataRow={ key: nodeID, text: text,"loc": locXY}
                    nodeData.push(nodeDataRow)
                }else if(tempNode.getNodeId()===3){
                    let locXY="-100 -120"
                    let text = "ID: "+nodeID+"\nType: "+nodeType+"\nStatus: "+switchType+"\nisTipped: "+isTripped+"\nFault Current: "+faultCurrent+"\nCurrent Power: "+currentPower
                    let nodeDataRow={ key: nodeID, text: text,"loc": locXY}
                    nodeData.push(nodeDataRow)
                }
                else if(tempNode.getNodeId()===7){
                    let locXY="-100 0"
                    let text = "ID: "+nodeID+"\nType: "+nodeType+"\nStatus: "+switchType+"\nisTipped: "+isTripped+"\nFault Current: "+faultCurrent+"\nCurrent Power: "+currentPower
                    let nodeDataRow={ key: nodeID, text: text,"loc": locXY}
                    nodeData.push(nodeDataRow)
                }else if(tempNode.getNodeId()===8){
                    let locXY="-100 120"
                    let text = "ID: "+nodeID+"\nType: "+nodeType+"\nStatus: "+switchType+"\nisTipped: "+isTripped+"\nFault Current: "+faultCurrent+"\nCurrent Power: "+currentPower
                    let nodeDataRow={ key: nodeID, text: text,"loc": locXY}
                    nodeData.push(nodeDataRow)
                }else if(tempNode.getNodeId()===9){
                    let locXY= "-100 240"
                    let text = "ID: "+nodeID+"\nType: "+nodeType+"\nStatus: "+switchType+"\nisTipped: "+isTripped+"\nFault Current: "+faultCurrent+"\nCurrent Power: "+currentPower
                    let nodeDataRow={ key: nodeID, text: text,"loc": locXY}
                    nodeData.push(nodeDataRow)
                }else if(tempNode.getNodeId()===4){
                    let locXY="200 -300"
                    let text = "ID: "+nodeID+"\nType: "+nodeType+"\nStatus: "+switchType+"\nisTipped: "+isTripped+"\nFault Current: "+faultCurrent+"\nCurrent Power: "+currentPower
                    let nodeDataRow={ key: nodeID, text: text,"loc": locXY}
                    nodeData.push(nodeDataRow)
                }else if(tempNode.getNodeId()===5){
                    let locXY="900 -240"
                    let text = "ID: "+nodeID+"\nType: "+nodeType+"\nStatus: "+switchType+"\nisTipped: "+isTripped+"\nFault Current: "+faultCurrent+"\nCurrent Power: "+currentPower
                    let nodeDataRow={ key: nodeID, text: text,"loc": locXY}
                    nodeData.push(nodeDataRow)
                }else if(tempNode.getNodeId()===10){
                    let locXY="200 0"
                    let text = "ID: "+nodeID+"\nType: "+nodeType+"\nStatus: "+switchType+"\nisTipped: "+isTripped+"\nFault Current: "+faultCurrent+"\nCurrent Power: "+currentPower
                    let nodeDataRow={ key: nodeID, text: text,"loc": locXY}
                    nodeData.push(nodeDataRow)
                }else if(tempNode.getNodeId()===14){
                    let locXY="200 240"
                    let text = "ID: "+nodeID+"\nType: "+nodeType+"\nStatus: "+switchType+"\nisTipped: "+isTripped+"\nFault Current: "+faultCurrent+"\nCurrent Power: "+currentPower
                    let nodeDataRow={ key: nodeID, text: text,"loc": locXY}
                    nodeData.push(nodeDataRow)
                }else if(tempNode.getNodeId()===13){
                    let locXY="900 240"
                    let text = "ID: "+nodeID+"\nType: "+nodeType+"\nStatus: "+switchType+"\nisTipped: "+isTripped+"\nFault Current: "+faultCurrent+"\nCurrent Power: "+currentPower
                    let nodeDataRow={ key: nodeID, text: text,"loc": locXY}
                    nodeData.push(nodeDataRow)
                }else if(tempNode.getNodeId()===11){
                    let locXY="600 -120"
                    let text = "ID: "+nodeID+"\nType: "+nodeType+"\nStatus: "+switchType+"\nisTipped: "+isTripped+"\nFault Current: "+faultCurrent+"\nCurrent Power: "+currentPower
                    let nodeDataRow={ key: nodeID, text: text,"loc": locXY}
                    nodeData.push(nodeDataRow)
                }else if(tempNode.getNodeId()===12){
                    let locXY="600 60"
                    let text = "ID: "+nodeID+"\nType: "+nodeType+"\nStatus: "+switchType+"\nisTipped: "+isTripped+"\nFault Current: "+faultCurrent+"\nCurrent Power: "+currentPower
                    let nodeDataRow={ key: nodeID, text: text,"loc": locXY}
                    nodeData.push(nodeDataRow)
                }

            }else if(nodeType==="Primary" && isPrimary){
                //console.log("Primary")
                let text = "ID: "+nodeID+"\nType: "+nodeType+"\nTotal Feeder Capcity: "+capacity
                let nodeDataRow={ key: nodeID, text: text,"loc": "-500 -100"}
                placex+=100;
                placey=100;
                isPrimary = false;
                nodeData.push(nodeDataRow)
            }
            else if(nodeType==="Primary" && !isPrimary){
                //console.log("Primary")
                let text = "ID: "+nodeID+"\nType: "+nodeType+"\nTotal Feeder Capcity: "+capacity
                let nodeDataRow={ key: nodeID, text: text,"loc": "-500 100"}
                placex+=100;
                placey=-100;
                isPrimary = false;
                nodeData.push(nodeDataRow)
            }
            else if(nodeType==="Start"){
                //console.log("Start")
                let nodeDataRow={ key: nodeID, text: "ID: "+nodeID+"\n"+nodeType,"loc": "-600 0"}
                nodeData.push(nodeDataRow)
            }else if(nodeType==="End"){
                //console.log("End")
                let text = "ID: "+nodeID+"\nType: "+nodeType+"\nStatus: "+switchType+"\nisTipped: "+isTripped+"\nFault Current: "+faultCurrent+"\nCurrent Power: "+currentPower
                let nodeDataRow={ key: nodeID, text: text,"loc": "900 0"}
                nodeData.push(nodeDataRow)
            }

        }
        this.setState({
            nodeDataArray: nodeData
        })
    }

    /*Generate node's links objects for GoJs Map*/
    generateLinkDataArray(){
        let allVertices = this.state.graph.getVertices();
        let linkArray=[]
        for(let i=0;i<allVertices.length;i++){
            let parentNode = allVertices[i]
            let parentNodeID = parentNode.getNodeId();
            for(let j=0;j<allVertices.length;j++){
                let childNode = allVertices[j]
                let childNodeID = childNode.getNodeId()
                //console.log("Link data array "+parentNodeID+","+childNodeID+"->"+parentNode.isAdjacent(childNode))
                if(parentNode.isAdjacent(childNode)){
                    let lineCapacity = parentNode.getLineCurrent(childNode)
                    let lineLength = parentNode.getLineLength(childNode)
                    let lineConduct = parentNode.getLineConductivity(childNode)
                    let text2 = "Current power: "+lineCapacity+"\nLength: "+lineLength+"\nCapacity: "+lineConduct
                    let linkRows={ "from": parentNodeID, "to": childNodeID, "text": text2};
                    linkArray.push(linkRows)
                }
            }
        }
        this.setState({
            linkDataArray: linkArray
        })
    }

    /*Change map details on change of the drop down*/
    selectMapEventHandler=(event)=>{
        this.setState({
            branch: event.target.value
        })
        firebase.database().ref().child('electricMap').orderByChild('1/branch').equalTo(event.target.value)
        .once('value')
        
        .then((snapshot) => {
            const val = snapshot.val().electricmap;
            this.setState({electricMap:val})
            this.generateGraph()
            this.generateLinkDataArray()
            this.generateNodeDataArray()
            this.checkingFaults()
            // console.log(this.state.graph.getVertex(0))
            // this.state.graph.BFS(this.state.graph.getVertex(0))
            //console.log(this.state.hasFaults)
            if(this.state.hasFaults){
                //console.log(this.state.hasFaults)
                this.findFaultEdges()
                this.findFaultPaths()
                console.log("++++++++++Graph+++++++++++++++")
                console.log(this.state.graph)
                console.log("++++++++++Tipped Switch+++++++++++++++")
                console.log(this.state.faultSwitch)
                console.log("++++++++++Fault Edge+++++++++++++++")
                console.log(this.state.faultEdges)
                console.log("++++++++++Raw Data Map+++++++++++++++")
                console.log(this.state.electricMap)
                console.log("++++++++++Recovery Paths+++++++++++++++")
                console.log(this.state.paths)
            }

        })
        .catch((e) => {
            console.log(e)
            Swal.fire({
                type: 'error',
                title: 'Oops...',
                text: 'Something went wrong!',
            })
        });

    }

    /*Find fault location*/
    checkingFaults(){
        let vertices = this.state.graph.getVertices()
        let found = false;
        for(let i=0;i<vertices.length;i++){
            let tempNode = vertices[i]
            //console.log(tempNode.getIsTripped())
            if(tempNode.getIsTripped()){
                found = true;
                this.setState(
                    {
                        faultSwitch: tempNode.getNodeId(),
                        hasFaults: true,
                    }
                )
               // console.log("has faults")
            }
        }
        if(!found){
            this.setState(
                {
                    hasFaults: false,
                }
            )
        }
    }
    showmap=()=>{
        this.setState({show:true})
    }
    hidemap =()=>{
        this.setState({show:false})
    }

    render() {
        return (
            <div className="d-flex" id="wrapper">
                <SideMenu  changevalue={this.showmap} hidemap={this.hidemap}/>
                <div id="page-content-wrapper" style={{padding: "0"}}>
                    <Header/>
                    <div className="container-fluid">
             
                    <div>
                    <div>
                        <div className="row bg-default">
                            <h2 className="btn btn warning" style={{padding: "5px"}}>Electric Grid</h2>
                        </div>
                        </div>
                        <div className="row">
                            <div className="col-md-3">
                                <AddExelSheet/>
                            </div>
                            <div className="col-md-3">
                            </div>
                            <div className="col-md-3">

                            </div>
                            <div className="col-md-3">
                                <SelectMap changed={this.selectMapEventHandler}/>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12">
                                <Map isTipped={this.state.faultSwitch} branch={this.state.branch} dataNodes={this.state.nodeDataArray} dataLinks={this.state.linkDataArray}/>
                                    <div className="row">
                                    <div className="col-md-9">
                                        <Path nodeDataArray={this.state.pathNodeArray} linkDataArray={this.state.pathLinkArray}/>
                                    </div>
                                    <div className="col-md-3">
                                        <FaultEdge nodeDataArrayFault={this.state.faultNodeArray} linkDataArrayFault={this.state.faultLinkArray}/>
                                    </div>
                                    </div>

                            </div>

                            </div>

                            </div>
                        
                    </div>

                </div>

            </div>
        );
    }
}
export default Dashboard
