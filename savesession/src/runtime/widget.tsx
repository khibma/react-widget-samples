/** @jsx jsx */
import { AllWidgetProps, BaseWidget, jsx } from 'jimu-core';
import { IMConfig } from '../config';
import { Button, Icon, TextInput } from 'jimu-ui';
import guts from './guts';
import SessionNameInputBox from './ui/session-input-box';
import SessionsListDD from './ui/drop-down';
import { configure } from '@testing-library/react';

export default class Widget extends BaseWidget<AllWidgetProps<IMConfig>, any> {    
  constructor(props) {
    super(props);   
    this.state = {
      appSessionName: "FooApp", // find how to get this from a settings
      sessionName: '',
      prvSessionList: [],
      inputError: {}
    }; 
    
  } 
  foo = guts();

  componentDidMount() { 

    this.setState(
      {prvSessionList : this.foo.listLocalStorage(this.state.appSessionName) }     
    );

  }

  change = (evt) =>{
    console.log(evt.target.value)
    this.setState(
      { sessionName: evt.target.value}, 
      this.isValid
    );
    console.log(this.state);
		
  };
  
  isValid = () => {
    let inputError = {};
    console.log("isvalid", this.state.sessionName.length)
    if (this.state.sessionName.length < 1){
      console.log("session name issue")
      inputError.sessionName = "Provide a session name";
    }

    for (var i = 0; i < this.state.prvSessionList.length; i++){
      if (this.state.sessionName === 
        localStorage.key(i).split(this.state.appSessionName+"_")[1]){
          inputError.sessionName = "Session name already exists, saving will overwrite";
          break;
      }      
    }

    this.setState({inputError});
    return Object.keys(inputError).length === 0;
  }

  saveSession(){

    console.log(this.props)
    this.foo.saveToStorage(this.state.appSessionName + "_" + this.state.sessionName);
    this.setState(
      {prvSessionList: [...this.state.prvSessionList, 
        {"name": this.state.sessionName,
        "val":this.state.appSessionName + "_" + this.state.sessionName}] }     
    )
    
  }

  clearSessions(){
    this.foo.clearLocalStorage(this.state.appSessionName);
    this.setState(
      {prvSessionList : [] }     
    )
  }
  
  render() {
    return (
      <div className="widget-demo jimu-widget m-2">
        <h3>Save Session Widget</h3>
        {/* <p>exampleConfigProperty: {this.props.config.exampleConfigProperty}</p> */}
        <p>Save the session of your current experience to your local storage or file</p>

        <h4>Save Session</h4>
        
        <SessionNameInputBox
          name='sessionName'
          sessionName=''
          value={this.state.sessionName}
          onChange={this.change}
          inputError={this.state.inputError}
      />
        <br /> 
        <Button 
          type="primary" 
          onClick={() => this.saveSession()}
          className ='mr-3' 
          disabled = {!this.state.sessionName}
        >
          Save to Storage
        </Button> 

        <Button 
          type="primary" 
          onClick={() => this.saveSession()}
          className ='mr-3' 
          disabled = {!this.state.sessionName}
        >
          Save to File
        </Button> 

        <h4>Load Existing Session</h4>
        <SessionsListDD options={this.state.prvSessionList}>
        </SessionsListDD>

        <br />
        <Button type="primary" className ='mr-3' >Load Selected</Button>    
        <Button type="primary" onClick={() => this.saveSession()} className ='mr-3' >Load from File</Button>
        
        <hr />
        <Button type="danger" onClick={() => this.clearSessions()} className ='mr-3' >Clear all sessions</Button>
      
      </div>
    );
  }
}
