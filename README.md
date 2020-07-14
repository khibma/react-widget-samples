# experience builder widget samples

Quickly find what the internet has created: https://github.com/search?o=desc&q=%22experience+builder%22&s=updated&type=Repositories

Attempt at creating some Experience Builder widgets.

As-is, none of these are ready to simply be plugged in.

## Lat-long
From Jackie Roberts

## Save Session
Just the UI, nothing working in the back end

## Measure
Works, but the UI needs to be cleaned up
This is a good proof of concept of making widgets from Esri JS 4.X API work inside XB

https://developers.arcgis.com/experience-builder/sample-code/js-api-widget/

https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Measurement.html

https://developers.arcgis.com/javascript/latest/sample-code/sandbox/index.html?sample=widgets-measurement


## Debug 

https://developers.arcgis.com/experience-builder/guide/debugging-widget-development/

## Getting Started

 - Create a new widget in `client\your-extensions\widgets\your widget` (can copy simple)
   - Inside `manifest.json` update the name to match the folder name
   - Add the `jimu-arcgis` as a dependency
 - `npm start` in `client`

 - From XB, create a new Experience, add the new widget. Save
 - To focus on widget, copy   `server\src\public\apps\X\config.json` to `client\dist\experience\configs\config.json`
 - open *localhost:3001/experience?config=configs/config.json*

#### VS Code
 - Open the /client folder as a project

#### config properties
match any properties the config.json and the `src\config.ts`  >> `export interface Config { **** }`


#### translations
 - in manifest.json add new locale for language
 - create `src\runtime\translations\default.ts` >> `export default { varName: "String" } `
 - create `src\runtime\translations\fr.js` >> `define ({ varName: "French String"     })`
 - in `widget.tsx`  >> `import defaultMessages from "./translations/default.ts"`;
 - helper function:
```  nls = (id:string) => {
   return this.props.intl 
    ? this.props.intl.formatMessage({
	  id:id,
	  defeaultMessage: defaultMessages[id],
	  })
	  : id;
};
```
 - then used by:  `this.nls('varName');`
 - to use:    *&locale=fr*   in the URL


