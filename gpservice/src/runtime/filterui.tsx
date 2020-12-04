/** @jsx jsx */
import {AllWidgetProps, BaseWidget, WidgetJson, React, ReactDOM, jsx, css, Immutable, WidgetType} from 'jimu-core';
import {JimuMapView, JimuFeatureLayerView, FeatureLayerDataSource } from 'jimu-arcgis';

import { Checkbox, TextInput, Slider , Select, Option, Button, MultiSelect, MultiSelectItem  } from 'jimu-ui';
import { toJSON } from 'esri/identity/IdentityManager';
import { Label } from 'reactstrap';

/* interface Stuff {
	jimuMapView?: JimuMapView;
	flayer: FeatureLayerDataSource ;
  } */


export default class Filter_UI extends BaseWidget<AllWidgetProps<{}>,  any>{

	constructor(props){
		super(props);
		
		console.log("this is da props", props)
		//this is filter's state. not overall state
		this.state = {
			ftime: 2015, 
			ttime: 2019,
			land: true,
			marinefin: true,
			marineshell: true,
			inactive: false,
			facid: null,
			company: null,
			useYears: false,
			clusterinOn: true,
		}
	  }

/* 	  getMultiSelectItems = (foo: boolean): MultiSelectItem[] => {
		return [
			{value:"fish1", label:"fish1"},
			{value:"fish2", label:"fish2"},
			{value:"fish3", label:"fish3"},
			{value:"fish4", label:"fish4"},
			{value:"fish5", label:"fish5"}
		]
	  } */

	search = (evt) => {
		//evt.preventDefault();
		//this.props.filter_ui_update(this.state)
		this.props.filter_ui_update([this.state, true])	
	}

	clear = () => {
		console.log(this.state)
		this.props.bad_q = false;  //this doesnt look to be reseting properly
		this.setState({
			ftime: 2015, 
			ttime: 2019,
			land: true,
			marinefin: true,
			marineshell: true,
			inactive: false,
			facid: "",
			company: "",
			useYears: false,
			clusterinOn: true,
			bad_q:false
		}, () => {
			//console.log("after: ", this.state)
			this.props.filter_ui_update([this.state, false])
		});		
	}

	UI_Update = (e) => {
		this.setState({
			land: (e.target.name == "landchk") ? !this.state.land : this.state.land, 
			marinefin: (e.target.name == "marinefinchk") ? !this.state.marinefin : this.state.marinefin, 
			marineshell: (e.target.name == "marineshellchk") ? !this.state.marineshell : this.state.marineshell,
			inactive:(e.target.name == "activechk") ? !this.state.inactive : this.state.inactive,
			useYears: (e.target.name == "useyears") ? !this.state.useYears : this.state.useYears,
			clusterinOn: (e.target.name == "clusterTgl") ? !this.state.clusterinOn : this.state.clusterinOn
		}, () => {
			this.props.filter_ui_update([this.state, false])
		})	
	}

	handleFacIDChange = (event) => {
		this.setState({
		  facid: event.target.value,
		});
	};

	handleCompanyChange = (event) => {
		this.setState({
		  company: event.target.value,
		});
	};

	fromTime = (evt) => {
		let t = this.state.ttime;
		this.setState({
			ftime: evt,
			ttime: (evt > t) ? evt : t
		}, () => {
			this.props.filter_ui_update([this.state, false])
		})
	}

	toTime = (evt) => {
		let t = this.state.ftime;
		this.setState({
			ttime: evt,
			ftime: (evt < t) ? evt : t
		}, () => {
			this.props.filter_ui_update([this.state, false]) 
		})
	}

	UI_Years = (evt) => {
		this.setState({
			useYears: (evt.target.name == "useyears") ? !this.state.useYears : this.state.useYears
		}, () => {
			this.props.filter_ui_update([this.state, false]) 
		})
	}

	//console.log("this is the checkbox toggle ", e)
	/* 	  
	this.setState({
		[e.target.name]: e.target.value,
	}); 
	*/


	 render() {
		//const props = this.props?.props || this.props;
		const indent = css`
        	text-indent: 30px;
		`;
		const buttonright = css`
			display: flex; 
			justify-content: flex-end;			
		`;
		const buttonmargin = css`
			margin-right: 10px;
		`;
		const highlight = css`
	
		:focus {
			outline:2px solid orange;
		  }
		`;
		
		  const BadSearch = () => {			
			if (!this.props.bad_q) return null;
		  
			return (
			  <span>Search returned 0 items</span>
			);
		  };

        return (
			<div>
				<Label tabIndex={2} css={highlight}>
				<Checkbox  aria-label="Group nearby, like points on the display" id="a" name="clusterTgl" checked={this.state.clusterinOn} onChange={(e) => {this.UI_Update({
					target: {
						name: e.target.name,
						value: e.target.checked,
						},
					}); 
					}}
				/> Cluster Facilities </Label>
				{" "}
				<Label tabIndex={2} css={highlight}>
				<Checkbox aria-label="Hide inactive facilities" name="activechk" checked={this.state.inactive} onChange={(e) => {this.UI_Update({
						target: {
							name: e.target.name,
							value: e.target.checked,
							},
						}); 
					}}
				/> Show Inactive Facilities   </Label>
				{/* </div> */}
			<hr width="100%" />
			<h3>Filter and Search Facilities</h3>

			<b>Filter Facilities by the type:</b> <br/>
			<Label tabIndex={2} css={highlight}>
			<Checkbox aria-label="landbased" name="landchk" checked={this.state.land} onChange={(e) => {this.UI_Update({
					target: {
						name: e.target.name,
						value: e.target.checked,
						},
					}); 
				}}
			/> Land based / Fresh Water </Label>
			{' '}
			<Label tabIndex={2} css={highlight}>
			<Checkbox aria-label="marine fin" name="marinefinchk" checked={this.state.marinefin} onChange={(e) => {this.UI_Update({
					target: {
						name: e.target.name,
						value: e.target.checked,
						},
					}); 
				}}
			/> Marine Finfish </Label>
			{' '}
			<Label tabIndex={2} css={highlight}>	
			<Checkbox aria-label="marine shell" name="marineshellchk" checked={this.state.marineshell} onChange={(e) => {this.UI_Update({
					target: {
						name: e.target.name,
						value: e.target.checked,
						},
					}); 
				}}
			/> Marine Shellfish</Label>

			<p/>

			<b>Reporting Drug or Pesticide Deposits by Year</b>
			<br></br>
			<Label tabIndex={2} css={highlight}>
			<Checkbox aria-label="Filter by reporting years" name="useyears" checked={this.state.useYears} onChange={(e) => {this.UI_Update({
					target: {
						name: e.target.name,
						value: e.target.checked,
						},
					}); 
				}}
			/>  Filter facilities to those that reported: </Label> {' '} 
			<div id="yeardiv" >
				<b>From: </b>
				<Select id="ftime" defaultValue={2015} useFirstOption={true} size="sm"  style={{width:"80px"}}
				onChange={(e) => this.fromTime(e.target.value)} value={this.state.ftime} disabled={!this.state.useYears}>
					<Option value={2015} selected>2015</Option>
					<Option value={2016}>2016</Option>
					<Option value={2017}>2017</Option>
					<Option value={2018}>2018</Option>
					<Option value={2019}>2019</Option>
					{/* <Option value={2020}>2020</Option> */}
				</Select>
				<b> To: </b>
				<Select id="ttime" defaultValue={2020} useFirstOption={false} size="sm"  style={{width:"80px"}}
				onChange={(e) => this.toTime(e.target.value)} value={this.state.ttime} disabled={!this.state.useYears}>
					<Option value={2015}>2015</Option>
					<Option value={2016}>2016</Option>
					<Option value={2017}>2017</Option>
					<Option value={2018}>2018</Option>
					<Option value={2019}>2019</Option>
					{/* <Option value={2020}>2020</Option> */}
				</Select>
			</div>
			<hr width="70%" />
			<b>Search by:</b><br/>
{/* 			Species:
			<MultiSelect 
                  items={Immutable(this.getMultiSelectItems(true))}
				//values={Immutable(["fish1", "fish2"])}
				size="sm"
                 className="search-multi-select"
                fluid={false}
                  placeHolder={"Select one or more species"}
                //   onClickItem={this.handleChooseSearchingFieldsChange}
				//   displayByValues={this.displaySelectedFields} 
				zIndex={100}
			/> */}
	
			Enter an ID to search (Federal/Provincial Authorization or B.C. Identifier):
			  <TextInput aria-label="Enter an ID to search (Federal/Provincial Authorization or B.C. Identifier)" 
			    placeholder="ID to search" defaultValue="" size="sm" style={{width:"200px"}}
				type="text"
				value={this.state.facid}
				onChange={this.handleFacIDChange}
			/>
			Company: 
			  <TextInput aria-label="Enter a company name to search"
			   placeholder="Enter company name" defaultValue="" size="sm" style={{width:"200px"}}
			   type="text"
			   value={this.state.company}
			   onChange={this.handleCompanyChange}
			   />
			<p />
			<BadSearch />
			<div css={buttonright}>
			<span tabIndex={2} css={highlight}> 
				<Button type="primary" size="sm" onClick={this.search} css={buttonmargin}>Search</Button>
			</span>
				<Button type="primary" size="sm" onClick={this.clear}>Reset</Button>
			</div>
			<p/>

			{/* <Slider min={2015} max={2020} step={1} defaultValue="2015"/> */}

			{/* <div><span dangerouslySetInnerHTML={{__html: this.state.genRptBtn}}></span></div> */}

      {/* <form onSubmit={this.formSubmit}> */}
  {/*       <div>
          Facility IDs: <input
            type="text"
            value={this.state.FACIDs}
            onChange={this.handleFacIDChange}
          />
          <br />
          Time Range:
          <div id="fromtime">
            <ButtonGroup aria-label="From time">
              <Button onClick={() => this.fromTime(2015)} active={this.state.ftime === 2015}>2015</Button>
              <Button onClick={() => this.fromTime(2016)} active={this.state.ftime === 2016}>2016</Button>
              <Button onClick={() => this.fromTime(2017)} active={this.state.ftime === 2017}>2017</Button>
              <Button onClick={() => this.fromTime(2018)} active={this.state.ftime === 2018}>2018</Button>
              <Button onClick={() => this.fromTime(2019)} active={this.state.ftime === 2019}>2019</Button>
              <Button onClick={() => this.fromTime(2020)} active={this.state.ftime === 2020}>2020</Button>
          </ButtonGroup>
          </div>
          <div id="totime">
            <ButtonGroup aria-label="To time">
              <Button onClick={() => this.toTime(2015)} active={this.state.ttime === 2015}>2015</Button>
              <Button onClick={() => this.toTime(2016)} active={this.state.ttime === 2016}>2016</Button>
              <Button onClick={() => this.toTime(2017)} active={this.state.ttime === 2017}>2017</Button>
              <Button onClick={() => this.toTime(2018)} active={this.state.ttime === 2018}>2018</Button>
              <Button onClick={() => this.toTime(2019)} active={this.state.ttime === 2019}>2019</Button>
              <Button onClick={() => this.toTime(2020)} active={this.state.ttime === 2020}>2020</Button>
            </ButtonGroup>
          </div>
          <br /> 
          
        </div>*/}
			
			</div>
		)
	}
  };