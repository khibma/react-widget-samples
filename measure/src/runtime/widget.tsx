import { React, BaseWidget, AllWidgetProps  } from 'jimu-core';
import { JimuMapViewComponent, JimuMapView } from 'jimu-arcgis';
import { IMConfig } from '../config';
import { Button } from 'jimu-ui';

import Measure = require('esri/widgets/Measurement');


interface State{
  jimuMapView: JimuMapView;
  measureActive: any;
  areaActive: any;
  activeTool: any;
}

export default class Widget extends BaseWidget<AllWidgetProps<IMConfig>, State>{
  apiWidgetContainer: React.RefObject<HTMLDivElement>;
  measureWidget: Measure;
  mapView: __esri.MapView | __esri.SceneView;

  constructor(props) {
    super(props);
    this.state = {jimuMapView: null,  
      measureActive: false,
      areaActive: false,
      activeTool: null}
    this.apiWidgetContainer = React.createRef();
  } 

  componentDidUpdate() {  
    console.log("component did update start")
    if(!this.mapView){
      console.log("NO MAPVIEW! WAAAH?")
      return;
    }   

    if(!this.measureWidget){
      this.measureWidget = new Measure({        
        view: this.mapView,
        container: this.apiWidgetContainer.current,
        linearUnit: this.props.config.units
      })
    }
    console.log("after is a measure widget?", this.measureWidget)
    
}

  componentWillUnmount(){
    console.log("inside will unmount")
    if(this.measureWidget){
      this.measureWidget.destroy();
      this.measureWidget = null;
    }

  }

  onActiveViewChange = (jimuMapView: JimuMapView) => {
    if(!(jimuMapView && jimuMapView.view)){
      return;
    }
    this.mapView = jimuMapView.view;
  }

 switchTool(t) {
    //const tool = this.measureWidget.activeTool === "distance" ? "area" : "distance";
    //https://developers.arcgis.com/javascript/latest/sample-code/sandbox/index.html?sample=widgets-measurement
    if (t !== 'clear'){
      this.measureWidget.activeTool = t;
    } else {
      this.measureWidget.clear();
    }
    
    this.setState({
      activeTool: t,
      measureActive: t==='distance' ? true : false,
      areaActive: t==='area' ? true : false
    })
    console.log(this.state)
   } 
  
  render() {
     if(!this.isConfigured()){
      return 'Select a map and assign default units';
    } 

      return <div className="widget-use-map-view" style={{width: '100%', height: '100%', overflow: 'hidden'}}>
        <h3>Measure Widget</h3>
        <Button type="primary" onClick={() => this.switchTool("distance")} 
          // className ='esri-widget--button esri-interactive esri-icon-measure-line'>
        className = {`esri-widget--button esri-interactive esri-icon-measure-line ${this.state.measureActive ? 'active': ''}`}>
        </Button>
        <Button type="primary" onClick={() => this.switchTool("area")} 
          // className ='esri-widget--button esri-interactive esri-icon-measure-area' >
          className = {`esri-widget--button esri-interactive esri-icon-measure-area ${this.state.areaActive ? 'active': ''}`}>
        </Button>
        <Button type="primary" onClick={() => this.switchTool("clear")} 
          className ='esri-widget--button esri-interactive esri-icon-trash' >
        </Button> 
        
        <JimuMapViewComponent useMapWidgetIds={this.props.useMapWidgetIds} onActiveViewChange={this.onActiveViewChange} ></JimuMapViewComponent>      
        <br /> 
        <div ref={this.apiWidgetContainer}></div>   

      </div>
  }  

  isConfigured = () => {
    return this.props.useMapWidgetIds && this.props.useMapWidgetIds.length === 1 && this.props.config.units;
  }

}
