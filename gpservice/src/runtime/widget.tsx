/** @jsx jsx */
import {React, AllWidgetProps, css, jsx, DataSourceStatus,  DataSourceComponent, DataRecord,
  DataSource, DataSourceTypes, defaultMessages as jimuCoreDefaultMessage  } from 'jimu-core';
import {loadArcGISJSAPIModules, JimuMapViewComponent, JimuMapView, JimuMapViewGroup} from "jimu-arcgis";
//import {FeatureLayerDataSource, } from 'jimu-arcgis/arcgis-data-source';
import defaultMessages from "./translations/default";
import { Button, Checkbox } from 'jimu-ui';
import Filter_UI from './filterui';
import {IMConfig} from '../config';

//import watchUtils = require("esri/core/watchUtils");

interface IState {
 FACIDs: number[];
 xMsgs: string;
 xMgsIdx: number;
 outputPDF: string;
 showOutputDiv: boolean;
 genRptBtn: boolean;
 jimuMapView: JimuMapView;
 facility_layer: string;
 clusterinOn: boolean;
 scale: string;
 ftime: number;
 ttime: number;
 where_clause: string;
 reportURL: string;
 bad_q: boolean;
 //extent: Extent
}

export default class Widget extends React.PureComponent<AllWidgetProps<{IMConfig}>, IState> {
 // Give types to the modules we import from the ArcGIS API for JavaScript
 // to tell TypeScript what types they are.
 Geoprocessor: typeof __esri.Geoprocessor;
 watchUtils: __esri.watchUtils;

 constructor(props){
   super(props);
   this.state = {
     FACIDs: [],  //defaultMessages.facIDs,
     xMsgs: "",
     xMgsIdx: 0,
     outputPDF: "",
     showOutputDiv: false,
     genRptBtn: false,
     jimuMapView: undefined, //null
     facility_layer: null,
     clusterinOn: true,
     scale: "",
     ftime: 2015, 
     ttime: 2019,
     where_clause: "1=1",
     reportURL: this.props.config?.reportingURL,
     bad_q: false
   };
 } 

/*   state: IState = {
   FACIDs: [],  //defaultMessages.facIDs,
   xMsgs: "",
   xMgsIdx: 0,
   outputPDF: "",
   showOutputDiv: false,
   genRptBtn: false,
   jimuMapView: undefined, //null
   facility_layer: null,
   clusterinOn: true,
   scale: "",
   ftime: 2015, 
   ttime: 2019,
   where_clause: ""
   //extent: undefined
 }; */

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

   // Lazy-loading (only load if/when needed) the ArcGIS API for JavaScript modules
   // that we need - only once the "Make Report" button is pressed.    
   loadArcGISJSAPIModules([
     "esri/tasks/Geoprocessor"
   ]).then((modules) => {
     [this.Geoprocessor] = modules;

     const gpurl = this.state.reportURL; //"https://msdidfo5.esriservices.ca/arcgis/rest/services/CAPRI/CapriReportX/GPServer/CAPRI%20Report";
     const gp = new this.Geoprocessor({
       url: gpurl
     });

     console.log(this.state.ftime + "_" + this.state.ttime)
     let params ={
       "facids": this.state.FACIDs.toString(),
       "Language": "eng",
       "Basemap": "topo",
       "Time_Range": this.state.ftime + "_" + this.state.ttime
     }
     var that = this;
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
               genRptBtn: false
             })             
           }
         })
       }).catch( function(e) {
         if (e.jobStatus === "job-failed"){
           // dump the msg queue to the box
           let msg = "FACIDs that caused failure: \n" + params['facids'] + "\n\n Messages from failed execution: \n";
           for (var m=0, ml= e['messages'].length; m < ml; m++) {              
              msg += e['messages'][m]['description'] + "\n";       		
           }
           that.state.xMsgs = msg
           // reset these vars
           that.setState({
             outputPDF: "Failed to create PDF",
             showOutputDiv : true,
             genRptBtn: true,
             xMgsIdx: 0
           });
         }
         
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
/*
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
   //  {this.renderCount.bind(this)}   <-- this from inside render at bottom
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
*/
 do_cluster = {
   type: "cluster",
   clusterRadius: "120px",
   popupTemplate: {
     content: "<b>{cluster_count}</b> facilities in this point.",
     fieldInfos: [{
       fieldName: "cluster_count",
       format: {
         digitSeparator: true,
         places: 0
       }
     }]
   }
 }

 where_manage = (from_ui) => {
   console.log("WHERE MANAGE ", from_ui)
   /* ui_state: {
     ftime: 2015, 
     ttime: 2020,
     land: true,
     marinefin: true,
     marineshell: true,
     inactive: false,
     facid: "",
     company: ""
   } */
   let ui_state = from_ui[0];
   let zoom = from_ui[1];

   let w = ""; // = this.state.where_clause;
   let toggles = [];
   if (ui_state.marinefin) {
     toggles.push("open_water_marine_finfish_yn = 'Y'")
   }
   if (ui_state.marineshell) {
     toggles.push("open_water_marine_shellfish_yn = 'Y'")
   }
   if (ui_state.land) {
     toggles.push("open_water_freshwater_yn = 'Y' OR land_based_system_yn = 'Y'")
   }
   if(toggles){
     w += "(" + toggles.join(" OR ") + ")"
   }  

   if (!ui_state.inactive){
     if (w){
       w += " AND "
     }
     w += "facility_status = 'Active'"
   }	

   if (ui_state.facid) {
     // add the OR incase someone is using a BC Identifer 
     w += " AND federal_provincial_authzn_no ='" + ui_state.facid + "' OR regional_identifier_no ='" + ui_state.facid + "'"		
   }
   if (ui_state.company) {
     w += " AND UPPER(recorded_licensee_name) LIKE UPPER('%" + ui_state.company + "%')"		
   } 
  
   if (ui_state.useYears){ 
     const yearReport = {
       2015:"rep_2015",
       2016:"rep_2016",
       2017:"rep_2017",
       2018:"rep_2018",
       2019:"rep_2019",
       //2020:"rep_2020"
     }
     let year_clause = "";
     Object.keys(yearReport).forEach(function(key){
       if (ui_state.ftime <= Number(key) && ui_state.ttime >= Number(key) ){
         year_clause +=  yearReport[key] + " = 'Y'"
       }
       if (year_clause && ui_state.ttime > key){
         year_clause += " OR "
       }
     }, this);				
     w += " AND (" + year_clause + ")";  
   }
 console.log(w)

/*  let widget_id = this.state.jimuMapView.mapWidgetId;
 let layer_view_id = widget_id + "-" + this.state.facility_layer;
 this.state.jimuMapView.jimuLayerViews[layer_view_id].layer.definitionExpression = w;
*/
 this.setState({
   ftime: ui_state.ftime,
   ttime: ui_state.ttime,
   where_clause: w
 }, () => {
   //console.log("after: ", this.state)
   if (zoom) { this.zoomTo() }
   else { this.layerDefintionUpdate() }
   
   this.state.jimuMapView.jimuLayerViews[this.state.facility_layer].layer.featureReduction = (ui_state.clusterinOn) ? this.do_cluster : null
 }) 

 //return w;
}

layerDefintionUpdate = () =>{
 console.log("calling into update stuff")

 let scale = this.state.jimuMapView.view.scale 

 //let widget_id = this.state.jimuMapView.mapWidgetId;
 //let layer_view_id = widget_id + "-" + this.state.facility_layer;
 //let queryParams = this.state.jimuMapView.jimuLayerViews[layer_view_id].layer.createQuery();
 let queryParams = this.state.jimuMapView.jimuLayerViews[this.state.facility_layer].layer.createQuery();
 //queryParams.returnExceededLimitFeatures = true
 //queryParams.maxRecordCount = 4000
 // Use extent to limit features
 queryParams.geometry = this.state.jimuMapView.view.extent;
 //queryParams.returnGeometry = true;
 console.log("Thye extent  ", queryParams.geometry.toJSON())

 // Use where clause (if one exists) to set definitionQuery
 if (this.state.where_clause){
   //this.state.jimuMapView.jimuLayerViews[layer_view_id].layer.definitionExpression = this.state.where_clause;
   this.state.jimuMapView.jimuLayerViews[this.state.facility_layer].layer.definitionExpression = this.state.where_clause;
   queryParams.where = this.state.where_clause //|| "1=1"
 }  

 // Clustering based on scale
  let clusterStatus = this.state.clusterinOn;
 if (scale < 400000){
   this.state.jimuMapView.jimuLayerViews[this.state.facility_layer].layer.featureReduction = null; //this.no_cluster;
   clusterStatus = false;          
 }  

 // Get count of facilities and their IDs
 let featureCount = 0;
 let fac_ids = [];
 let that = this;

  this.state.jimuMapView.jimuLayerViews[this.state.facility_layer].view.layer.queryFeatures(queryParams).then(function(results){ 
  // console.log("QUERY FINISHED")    
   featureCount = results.features.length;    
   results.features.forEach( feat => fac_ids.push(feat['attributes']['fac_id'])) 
   
   that.setState({    
     FACIDs: fac_ids,
     genRptBtn: (featureCount > 20) ? true : false,
     clusterinOn : clusterStatus,
     scale: scale.toString()
   }); 
 }); 

}

mapCreate = (jmv) => {
 
 console.log("map view created", jmv)

 //Can I get the layerview id in here
 //ie from the viewchangehandler   let f_layer_id = Object.keys(jmv.jimuLayerViews )[0] 
 return
}

zoomTo = () => {
 let queryParams = this.state.jimuMapView.jimuLayerViews[this.state.facility_layer].layer.createQuery();
 //queryParams.geometry = this.state.jimuMapView.view.extent;
 queryParams.where = this.state.where_clause;
 console.log("zooming to clause: ", queryParams)
 this.state.jimuMapView.jimuLayerViews[this.state.facility_layer].layer.queryExtent(queryParams).then(function(results){ 
   console.log("zoom results  ", results)
   //this.state.jimuMapView.jimuLayerViews[this.state.facility_layer].view.goTo(results.extent)
   if (results.count > 0) {
    this.setState({
      bad_q: false
    })
    const extent = results.extent;
     if (results.count ==1 ){
      const zoomScale = 16000;      
      extent.expand((zoomScale / this.state.jimuMapView.view.scale ) * this.state.jimuMapView.view.resolution );
     }      
      this.state.jimuMapView.view.goTo(extent)    
     console.log("searched zoom extent: ",results.extent.toJSON())
     //this.state.jimuMapView.view.goTo(extent)
    this.layerDefintionUpdate()

   } else {
     this.setState({
       bad_q: true
     })
   }
  }.bind(this)

  ).catch(
    function(e) {
      console.log(e)
    }); 
}

 
 activeViewChangeHandler = (jmv: JimuMapView) => {
   console.log("view changed")
   if (jmv) {

     let widget_id = jmv.mapWidgetId;
     let f_layer_id = Object.keys(jmv.jimuLayerViews )[0]
     //let layer_view_id = widget_id + "-" + f_layer_id; //this.state.facility_layer;
     let layer_view_id = f_layer_id; //this.state.facility_layer;
     if (this.state.clusterinOn){
         jmv.jimuLayerViews[layer_view_id].layer.featureReduction = this.do_cluster;
     }
     this.setState({
       jimuMapView: jmv,
       facility_layer: f_layer_id,
       //clusterinOn : true
     }, () => {
       
   //// this can go if I can figure out timing of the import of watch above
       loadArcGISJSAPIModules([
         "esri/core/watchUtils"
       ]).then((modules) => {
         [this.watchUtils] = modules;
   
         this.watchUtils.whenTrue(jmv.view, "stationary", (evt) => {   
           console.log("extent has changed",evt)      
           this.layerDefintionUpdate()
         });
     })
   })
/*     jmv.view.watch("extent", (evt: Extent) => {
     console.log("Extent change: ", evt.extent)
     this.setState({
       extent:evt.extent      
     })
   }); */



// above goes


// this can be used if i can get timing of regular watch import
/*      watchUtils.whenTrue(jmv.view, "stationary", (evt) => {   
       console.log("extent has changed",evt)      
       this.layerDefintionUpdate()
     }); */
// above comes back
          
/* 
     this.watchUtils.whenTrue(jmv.view, "stationary", (evt) => {
     //jmv.view.watch("stationary", (evt) => {
       console.log("extent has changed",evt)

       this.layerDefintionUpdate(["", evt])

       let clusterStatus = true;
       if (evt < 400000){
         let widget_id = this.state.jimuMapView.mapWidgetId;
         let layer_view_id = widget_id + "-" + this.state.facility_layer;
         this.state.jimuMapView.jimuLayerViews[layer_view_id].layer.featureReduction = null; //this.no_cluster;
         clusterStatus = false;          
       } 
  
       this.setState({
         clusterinOn : clusterStatus,
         scale: evt
       })       

     });    */ 
   }
 } 




   //clust handling logic is now moved into filter_ui
/* 
   clusterPointsTgl = (e) => {
     console.log("cluster toggle button called")
     this.setState({
       clusterinOn: (e.target.name == "clusterTgl") ? !this.state.clusterinOn : this.state.clusterinOn
     }, () => {
       //let widget_id = this.state.jimuMapView.mapWidgetId;
       //let layer_view_id = widget_id + "-" + this.state.facility_layer;
       this.state.jimuMapView.jimuLayerViews[this.state.facility_layer].layer.featureReduction = (this.state.clusterinOn) ? this.do_cluster : null
     })
   } */
/* 
 clusterPointsTgl = () => {
   console.log("cluster toggle button called")
   this.setState({
     clusterinOn: !this.state.clusterinOn
   }, () => {
     //let widget_id = this.state.jimuMapView.mapWidgetId;
     //let layer_view_id = widget_id + "-" + this.state.facility_layer;
     this.state.jimuMapView.jimuLayerViews[this.state.facility_layer].layer.featureReduction = (this.state.clusterinOn) ? this.do_cluster : null
   })
 } */

   //  ?? componentDidUpdate()
/*     componentDidMount () {   
     console.log("COMPONENT UPDATE") 
     if (this.state.jimuMapView){
       let widget_id = this.state.jimuMapView.mapWidgetId;
       let layer_view_id = widget_id + "-" + this.state.facility_layer;
       if (this.state.clusterinOn){
         this.state.jimuMapView.jimuLayerViews[layer_view_id].layer.featureReduction = this.do_cluster;
         this.setState({
           clusterinOn : true
         })
       }
     }
   } */
 

 render() {
   const style = css`
     height: 420px;
     width:400px;
     margin:5px;
   `;
   const indent = css`
       text-indent: 30px;
       margin-bottom: 5px;
   `;

   const PDFDIV = () => (
    <div id="PDF" dangerouslySetInnerHTML={{__html: this.state.outputPDF }} /> 
   )
 
   return (
     <div className="widget-gpReport jimu-widget" css={style}>   

       {this.props.hasOwnProperty("useMapWidgetIds") &&
           this.props.useMapWidgetIds &&
           this.props.useMapWidgetIds.length === 1 && 
           this.props.useDataSources[0].dataSourceId && (
             <JimuMapViewComponent
               useMapWidgetIds={this.props.useMapWidgetIds}
               onViewsCreate ={this.mapCreate}
               onActiveViewChange={this.activeViewChangeHandler}                          
             />
             // extraProps={this.props.useDataSources[0]
       )}

       <div><h2>
         <span dangerouslySetInnerHTML={{__html: (this.state.FACIDs.length > 1999) ? "Facilities in view: 2000+" : "Facilities in view: " +this.state.FACIDs.length}} />
       </h2></div>
       <b>Display Options</b>
      {/*  <div css={indent}>
         <Checkbox aria-label="Group nearby, like points on the display" name="clusterTgl" checked={this.state.clusterinOn} onChange={(e) => {this.clusterPointsTgl({
             target: {
               name: e.target.name,
               value: e.target.checked,
               },
             }); 
           }}
         /> Cluster Facilities


       <Button onClick={this.clusterPointsTgl} size="sm" 
         active={this.state.clusterinOn}
         aria-label="Group nearby, like points on the display."
         >Cluster Points</Button>
       </div> */}
       
       <Filter_UI filter_ui_update={this.where_manage} bad_q={this.state.bad_q}/>    

       <p>{defaultMessages.instructions}</p>

       <button disabled={this.state.genRptBtn} onClick={this.formSubmit}>{defaultMessages.launchGPService} </button>

       {/* Show the download PDF div when there is a value */}
       {this.state.showOutputDiv ? <PDFDIV/> : null }

       <div id="serviceMsgs">          
           <textarea id="messages" rows={12} cols={40} value={this.state.xMsgs} />
       </div>

       <div id="appinfo"> 
       <b>app info</b>: <br />
         {/* GP Service is running: {this.state.genRptBtn.toString()} <br></br> */}
         Clustering: {this.state.clusterinOn.toString()} <br></br>
         Scale: {this.state.scale} <br></br>
       </div>    

/*       <DataSourceComponent  widgetId={this.props.id} useDataSource={this.props.useDataSources[0]} onDataSourceCreated={this.onDs}>

     </DataSourceComponent>    */

   </div>
   );
 }
}
