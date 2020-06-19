import {React, Immutable, DataSourceManager} from 'jimu-core';
import {BaseWidgetSetting, AllWidgetSettingProps } from 'jimu-for-builder';
import {JimuMapViewSelector, SettingSection, SettingRow} from 'jimu-ui/setting-components';
import { Radio, Label, Select, Option } from 'jimu-ui';
import { IMConfig } from "../config"; 
import {ArcGISDataSourceTypes} from 'jimu-arcgis';

export default class Setting extends BaseWidgetSetting<
  AllWidgetSettingProps<IMConfig>,
  any
>{
/*   supportedTypes = Immutable([ArcGISDataSourceTypes.WebMap]);
  dsManager = DataSourceManager.getInstance(); */

  onMapSelected = (useMapWidgetIds: string[]) => {
    this.props.onSettingChange({
      id: this.props.id,
      useMapWidgetIds: useMapWidgetIds
    });
  }

  radioChange = (evt) => {
    console.log(evt.currentTarget.value);
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set("units", evt.currentTarget.value)
    });
    console.log(this.props)
  }
    

  render(){
    return <div className="sample-use-map-view-setting p-2">
      Assign a map: 
      <br></br>
      <JimuMapViewSelector onSelect={this.onMapSelected} useMapWidgetIds={this.props.useMapWidgetIds}/>
      <br></br>
      Units: 
      <SettingSection >
        <Label className="m-1">              
          <Radio name="unitRadioMetric" value="metric" 
          onChange={this.radioChange} checked={this.props.config.units==='metric'} /> Metric 
        </Label>
        <Label className="m-1">
          <Radio name="unitRadioImperial" value="imperial" 
            onChange={this.radioChange} checked={this.props.config.units==='imperial'}/> Imperial 
        </Label>
      </SettingSection>
    </div>
  }
}