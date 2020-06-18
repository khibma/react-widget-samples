import {React} from 'jimu-core';
import { Dropdown, DropdownButton, DropdownMenu, DropdownItem } from 'jimu-ui';


const SessionsListDD = (props) => {
	let options = props.options.map(v => (
		<DropdownItem value={v.id}>{v.name}</DropdownItem>
	));

	

  return (
	<Dropdown >
	<DropdownButton size="sm">Selection Session</DropdownButton>
	<DropdownMenu>
		{options}
{/* 	<DropdownItem>Another Action</DropdownItem>
	<DropdownItem>Another Action</DropdownItem> */}
	</DropdownMenu>
	</Dropdown>
  );
};

export default SessionsListDD;


