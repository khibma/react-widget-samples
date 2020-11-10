/** @jsx jsx */
import {React, AllWidgetProps, css, jsx } from 'jimu-core';
import {loadArcGISJSAPIModules, JimuMapViewComponent, JimuMapView} from "jimu-arcgis";
import { IMConfig } from '../config';
import defaultMessages from "./translations/default";

interface IState {
  FACIDs: string;
  yearrange: string;
  xMsgs: string;
  xMgsIdx: number;
  outputPDF: string;
  showOutputDiv: boolean;
  jimuMapView: JimuMapView;
}

export default class Widget extends React.PureComponent<
  AllWidgetProps<IMConfig>,
  IState
> {
  // Give types to the modules we import from the ArcGIS API for JavaScript
  // to tell TypeScript what types they are.
  Geoprocessor: typeof __esri.Geoprocessor;

  state = {
    FACIDs: defaultMessages.facIDs,
    yearrange: defaultMessages.yearrange,
    xMsgs: "",
    xMgsIdx: 0,
    outputPDF: "",
    showOutputDiv: false,
    jimuMapView: null,
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
    /* 
    if (!this.state.jimuMapView) {
      // Data Source was not configured - we cannot do anything.
      console.error("Please configure a Data Source with the widget.");
      return;
    }
     */
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
                showOutputDiv : true
              })             
            }
          })
        })     

      });

    });
  };

  render() {
    const style = css`
    .widget-gpReport{
      height: 420px;
    }
    .widget-setting-addLayers {
      .checkbox-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        }
      }
    `;
    const textareastyle = css`
    .textareastyle {
      width: 200px;
      height: 200px;
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
              onActiveViewChange={(jmv: JimuMapView) => {
                this.setState({
                  jimuMapView: jmv,
                });
              }}
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
          <button>{defaultMessages.launchGPService}</button>
        </div>
        
        {/* Show the download PDF div when there is a value */}
        {this.state.showOutputDiv ? <PDFDIV/> : null }

        <div id="serviceMsgs">
          <textarea id="messages" rows={12} cols={40} value={this.state.xMsgs} className="textareastyle" />
        </div>
      </form>
    </div>
    );
  }

}
