import {React} from 'jimu-core';
import { FormGroup, Input, FormFeedback } from 'reactstrap'; //or 'reactstrap'
//import PropTypes from 'prop-types';
import { TextInput } from 'jimu-ui';

const SessionNameInputBox = (props) => {
  return (
    <FormGroup className='form-label-group'>
      <TextInput
        type='text'
        id={props.name}
        name={props.name}
        placeholder={props.sessionName}
        value={props.value}
        onChange={props.onChange}
        invalid={!!props.inputError[props.name]}
      />
      {/*  this label will put the sessionName below the input box, in the "error" spot.
           not really useful, but could be useful elsewhere.
       <label for={props.name}>{props.sessionName}</label> 
       */}
      <FormFeedback>{props.inputError[props.name]}</FormFeedback>
    </FormGroup>
  );
};

export default SessionNameInputBox;

/* SessionNameInputBox.propTypes = {
  sessionName: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  inputError: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
}; */
