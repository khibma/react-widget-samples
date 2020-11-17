import {React, DataSource, Immutable, UseDataSource} from 'jimu-core';
import {AllWidgetSettingProps} from 'jimu-for-builder';
import {DataSourceSelector, AllDataSourceTypes, FieldSelector} from 'jimu-ui/advanced/data-source-selector';
import { JimuMapViewSelector} from "jimu-ui/advanced/setting-components";
//import {ArcGISDataSourceTypes} from 'jimu-arcgis';

/*  interface State {
  datasource: DataSource;
}  */

export default class Setting extends React.PureComponent<AllWidgetSettingProps<{}>, {}>{
  //supportedTypes = Immutable([AllDataSourceTypes.FeatureLayer, AllDataSourceTypes.WebMap]);
/*   constructor(props){
    super(props);
    this.state = {
      datasource: null
    };

  } */

  onDataSourceChange = (useDataSources: UseDataSource[]) => {
    if(!useDataSources){
      return;
    }
    
    this.props.onSettingChange({
      id: this.props.id,
      useDataSources: useDataSources
    });
  }

  onMapSelected = (useMapWidgetIds: string[]) => {
    this.props.onSettingChange({
      id: this.props.id,
      useMapWidgetIds: useMapWidgetIds,
    });
  };


  // Render
  render(){
    return <div className="widget-setting p-2">  

    <div> Set the map
      <JimuMapViewSelector
        onSelect={this.onMapSelected}
        useMapWidgetIds={this.props.useMapWidgetIds}
      />
    </div>
    <div className="use-feature-layer-setting p-2">
      <DataSourceSelector 
          types={Immutable([AllDataSourceTypes.FeatureLayer])}
                useDataSourcesEnabled={true} 
                mustUseDataSource={true}
                useDataSources={this.props.useDataSources}
                onChange={this.onDataSourceChange}
                widgetId={this.props.id}
      />
    </div>
    </div>
  }
}