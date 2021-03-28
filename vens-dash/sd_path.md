## Link vens-dash to your SD model

Before starting your app for the first time, you need to specify where is your sd model located. One way to do that is by running:

```bash
npm run build "path\to\sd\model.mdl"
```

### Valid path variables
To make sure the build is succesful, you need to specify a valid path for the .mdl model and the Vensim-compiled files in the web folder next to it. You can do that by passing either of the MDL_PATH or SD_PATH variables. Here we explain what they are and then [how to set them](#Set-path-variables).
* MDL_PATH is the full path to the model and avoids ambiguity on which is the .mdl file of your model.
* SD_PATH is the parent directory containing the .mdl file.
In case only the SD_PATH is specified, the app will assume there is only one .mdl model in the folder and generate the MDL_PATH automatically; if that is not the case, then you must specify the MDL_PATH or the build might fail.

Whatever path is passed, it is crucial that next to the .mdl file there is a subdirectory called "web" containing the files published by Vensim. In particular the web folder should contain the following files: `mdl.js` and `mdl.wasm`. Without these, the model will not be able to run on the browser.
Remember that if you change your model after having cutomized your dashboard, you will need to republish the web folder in Vensim and then re run `npm run build` (you won't need to specify again the path unless you moved the files somewhere else).
Now that we know what SD_PATH and MDL_PATH are, let's see how to set them.

### Set path variables
One way to point vens-dash to your model is specifying its [path when running the build command](#link-vens-dash-to-your-SD-model). If your path point to a directory rather than an .mdl file, it will be interpreted as sd folder (SD_PATH), with the .mdl file sitting within it.
Alternatively you can pass the path variable(s) by either (or):
* Before launching the build command, set the MDL_PATH (or SD_PATH) environment variable via command line (e.g. on Windows: `SET MDL_PATH="path\to\sd\model.mdl"`; on Unix `EXPORT MDL_PATH="path\to\sd\model.mdl"`);
* Locate the file named ".env" in the root directory (same level as app.js) adding(/modifying) the line: `MDL_PATH="path\to\sd\model.mdl`"
* Copy and paste the content of your sd directory in the app sub-folder named 'sd'.

If more than one method is used to specify the MDL_PATH (or SD_PATH), the order of priority is: 1) argument passed explicitly when calling `npm run build`; 2) environment vairable set via command line; 3) the path specified in the .env file; 4) the default internal location './sd'.
