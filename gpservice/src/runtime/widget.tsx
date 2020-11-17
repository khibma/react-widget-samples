/** @jsx jsx */
import {React, AllWidgetProps, css, jsx, DataSourceStatus,  DataSourceComponent, DataRecord,
   DataSource, DataSourceTypes, defaultMessages as jimuCoreDefaultMessage  } from 'jimu-core';
import {loadArcGISJSAPIModules, JimuMapViewComponent, JimuMapView} from "jimu-arcgis";
//import {FeatureLayerDataSource, } from 'jimu-arcgis/arcgis-data-source';
import defaultMessages from "./translations/default";


interface IState {
  FACIDs: string;
  yearrange: string;
  xMsgs: string;
  xMgsIdx: number;
  outputPDF: string;
  showOutputDiv: boolean;
  genRptBtn: boolean;
  jimuMapView: JimuMapView;
  facility_layer: string;
  clusterinOn: boolean;
  scale: string;
  gpRunning: boolean;
}

export default class Widget extends React.PureComponent<AllWidgetProps<{}>, IState> {
  // Give types to the modules we import from the ArcGIS API for JavaScript
  // to tell TypeScript what types they are.
  Geoprocessor: typeof __esri.Geoprocessor;

  state: IState = {
    FACIDs: defaultMessages.facIDs,
    yearrange: defaultMessages.yearrange,
    xMsgs: "",
    xMgsIdx: 0,
    outputPDF: "",
    showOutputDiv: false,
    genRptBtn: false,
    jimuMapView: undefined, //null
    facility_layer: null,
    clusterinOn: true,
    scale: "",
    gpRunning: false
  };

  // Every time the input box value changes, this function gets called.
  // We set our component's state so we can use the value in the formSubmit function.
  handleFacIDChange = (event) => {
    this.setState({
      FACIDs: event.target.value,
    });
  };
  handleYearRangeChange = (event) => {
    this.setState({
      FACIDs: event.target.value,
    });
  };

  cleanup = () => {
     // Clear the UI pieces when job submitted
    this.setState({
      outputPDF: "",
      showOutputDiv: false,
      xMgsIdx: 0,
      xMsgs: ""
    })
  }

  formSubmit = (evt) => {
    evt.preventDefault();

    this.cleanup();

    // Error cases    
    if (!this.state.jimuMapView) {
      // Data Source was not configured - we cannot do anything.
      console.error("Please configure a Data Source with the widget.");
      return;
    }
     
    if (this.state.FACIDs == "") {
      // Nothing was typed into the box!
      alert("Ensure Facility IDs have been entered");
      return;
    }

    // Lazy-loading (only load if/when needed) the ArcGIS API for JavaScript modules
    // that we need - only once the "Make Report" button is pressed.
    loadArcGISJSAPIModules([
      "esri/tasks/Geoprocessor"
    ]).then((modules) => {
      [this.Geoprocessor] = modules;
      this.setState({
        gpRunning: true
      })

      const gpurl = "https://msdidfo5.esriservices.ca/arcgis/rest/services/CAPRI/CapriReportX/GPServer/CAPRI%20Report";
      const gp = new this.Geoprocessor({
        url: gpurl
      });

      let params ={
        "facids": this.state.FACIDs,
        "Language": "eng",
        "Basemap": "topo",
        "Time_Range": this.state.yearrange
      }

      gp.submitJob(params).then( jobInfo => {
        var jobid = jobInfo.jobId;            
        
        // options is a callback from waitForJobComplete that we use to track service execution messages
        var options = {
          interval: 1500,
          statusCallback: j => {
            for (var m=this.state.xMgsIdx, ml= j['messages'].length; m < ml; m++) {              
              this.state.xMsgs += j['messages'][m]['description'] + "\n";       		
            }
            // Call setState after we've looped through all messages to cause the textarea to render them
            this.setState({
              //The disable of the generate report button is getting stepped on by the number of features
              //  End goal is to only show when more than "20" features are in the display.
              //  Once less then 20, can remove the UI element and then allow report generation.
              //  will need to revisit the overall logic.
              genRptBtn: true,
              xMgsIdx: j['messages'].length
            });
          }
        };

        gp.waitForJobCompletion(jobid, options).then( () => {
          var outputPDF = gp.getResultData(jobid, "Output_PDF");
          outputPDF.then( x => {
            if (x.value){
              this.setState({
                outputPDF: "<a href='"+ x.value['url'] + "' target=_blank>Download File (right-click, save-as)</a>",
                showOutputDiv : true,
                genRptBtn: false,
                gpRunning: false
              })             
            }
          })
        })
      });

    });
  };

  isDsConfigured = () => {
    if (this.props.useDataSources &&
      this.props.useDataSources.length === 1) {
      return true;
    }
    return false;
  }

  onDs = (ds) => {
    this.setState({
      facility_layer: ds.id
    })
  }

  query = () => {
    let geometry = (this.props.stateProps && this.props.stateProps.EXTENT_CHANGE) ? this.props.stateProps.EXTENT_CHANGE: null;
    return {
      where: '1=1',
      outFields: ['*'],
      geometry: geometry
    }
  }

  renderCount (ds: DataSource, queryStatus: DataSourceStatus, records:DataRecord[], toto:any) {
    let featureCount = 0;
    let fac_ids = [];
    if(this.isDsConfigured()){
      featureCount = ds.getRecords().length;

      ds.getRecords().forEach( feat => fac_ids.push(feat['feature']['attributes']['fac_id']))
      this.setState({
        FACIDs: fac_ids.toString(),
        genRptBtn: (featureCount > 20) ? true : false
      })
    }
    return <span>{defaultMessages.featuresDisplayed} : {featureCount}</span>
  }

  do_cluster = {
    type: "cluster",
    clusterRadius: "120px",
    popupTemplate: {
      content: "This cluster represents <b>{cluster_count}</b> features.",
      fieldInfos: [{
        fieldName: "cluster_count",
        format: {
          digitSeparator: true,
          places: 0
        }
      }]
    }
  }

  no_cluster = {
    type: "cluster",
    clusterRadius: "10px",
    popupTemplate: {
      content: "This cluster represents <b>{cluster_count}</b> features.",
      fieldInfos: [{
        fieldName: "cluster_count",
        format: {
          digitSeparator: true,
          places: 0
        }
      }]
    }
  }
  // componentDidMount ??
  componentDidUpdate () {    
    if (this.state.jimuMapView){
      let widget_id = this.state.jimuMapView.mapWidgetId;
      let layer_view_id = widget_id + "-" + this.state.facility_layer;
      this.state.jimuMapView.jimuLayerViews[layer_view_id].layer.featureReduction = this.do_cluster;
      this.setState({
        clusterinOn : true
      })
    }

  }
  
  activeViewChangeHandler = (jmv: JimuMapView) => {
    if (jmv) {
      this.setState({
        jimuMapView: jmv
      });
      
    //jmv.view.watch("extent", (evt: Extent) => {
      jmv.view.watch("scale", (evt) => {
        console.log(evt)
        let clusterStatus = true;
        if (evt < 100000){
          let widget_id = this.state.jimuMapView.mapWidgetId;
          let layer_view_id = widget_id + "-" + this.state.facility_layer;
          this.state.jimuMapView.jimuLayerViews[layer_view_id].layer.featureReduction = this.no_cluster;
          clusterStatus = false;
        } 
        this.setState({
          clusterinOn : clusterStatus,
          scale: evt
        })        

      });
    }
  }


  render() {
    const style = css`
    .widget-gpReport{
      height: 420px;
    }
    `;
    const PDFDIV = () => (
     <div id="PDF" dangerouslySetInnerHTML={{__html: this.state.outputPDF }} /> 
    )
  
    return (
      <div className="widget-gpReport jimu-widget" css={style}>
      {this.props.hasOwnProperty("useMapWidgetIds") &&
          this.props.useMapWidgetIds &&
          this.props.useMapWidgetIds.length === 1 && (
            <JimuMapViewComponent
              useMapWidgetIds={this.props.useMapWidgetIds}
              onActiveViewChange={this.activeViewChangeHandler}
            />
          )} 

      <p>{defaultMessages.instructions}</p>

      <form onSubmit={this.formSubmit}>
        <div>
          Facility IDs: <input
            type="text"
            value={this.state.FACIDs}
            onChange={this.handleFacIDChange}
          />
          <br />
          Time Range: <input
            type="text"
            value={this.state.yearrange}
            onChange={this.handleYearRangeChange}
          />
          <br />
          <button disabled={this.state.genRptBtn}>{defaultMessages.launchGPService}</button>
        </div>
        
        {/* Show the download PDF div when there is a value */}
        {this.state.showOutputDiv ? <PDFDIV/> : null }

        <div id="serviceMsgs">
          <textarea id="messages" rows={12} cols={40} value={this.state.xMsgs} />
        </div>
      </form>

      <DataSourceComponent  query={this.query()} widgetId={this.props.id} useDataSource={this.props.useDataSources[0]} onDataSourceCreated={this.onDs}>
        {this.renderCount.bind(this)}
      </DataSourceComponent>     

      <div id="appinfo"> 
      <b>app info</b>: <br />
        GP Service is running: {this.state.gpRunning.toString()} <br></br>
        Clustering: {this.state.clusterinOn.toString()} <br></br>
        Scale: {this.state.scale} <br></br>
      </div>    
      

    </div>
    );
  }

}
