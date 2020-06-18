
export default function guts () {


	function saveToStorage(sessionName){
		console.log(sessionName);
		//var session = this.getSettingsFromMap();
		//session['name'] = sessionName + "_" + this.sessionNameTextBox.value;
		var session = {};
		session['name'] = sessionName

		var sessionString = JSON.stringify(session);
		sessionString = "[" + sessionString + "]";

		localStorage.setItem(session['name'], sessionString);
		//this._makeSelectLoadOption(this.sessionNameTextBox.value, session.name);
		/*
		if (this.sessionChooserAttach.options.length > 0){
			this._enableFromStorageBtn();
			this._enableClearBtn();
		}
		*/

	}

	function listLocalStorage(appSessionName){
		var ls = [];
		for (var i = 0; i < localStorage.length; i++){
			if (localStorage.key(i).indexOf(appSessionName) >=0){
				ls.push(
					{"name":localStorage.key(i).split(appSessionName+"_")[1],
					"val":localStorage.key(i)
				})      
			}
		}

		return ls;
	}

	function getFromStorage(session2load) {

		var ls = localStorage.getItem(session2load);
		//console.log('retrievedObject: ', JSON.parse(ls));
		console.log(JSON.parse(ls)[0]);

		//this.loadSession(JSON.parse(ls)[0]);  
		return ls;

	}

	function clearLocalStorage(sessionName){
		for (var i = 0; i < localStorage.length; i++){
			if (localStorage.key(i).indexOf(sessionName) >=0){
				localStorage.removeItem(localStorage.key(i));
				i--;
			}
		}

	}
	return {
		listLocalStorage,
		saveToStorage,
		getFromStorage,
		clearLocalStorage
	};
}