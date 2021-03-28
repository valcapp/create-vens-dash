# Vensim Dashboard Generator

This app allows to build a dashboard interface from a Vensim system dynamics model and to run it locally on modern browser (i.e. not IE).

## Purpose
Load your system-dynamics working folder and and run the app to serve locally a simple web-page o for your model with a dynamically responsive dashboard.

You would be able to customize by:
* changing the text content of some page elements
* deciding which input sliders to and output charts to display on the dashboard
* changing the diagram in display on the dashboard
* customizing the setup for the model (baseline inputs configuration)
* adding multiple tabs for the setup and the dashboard

## Requirements

This app requires [Node.js](https://nodejs.org/). Before running this application, you need to compile the Vensim model into WebAssembly first. [This functionality](#https://www.vensim.com/documentation/publishing-a-model-to-the-inte.html) is available from version 8.1 of Vensim.

## Usage

Too see the web dashboard of your sd model, you need to clone (or npm install) the vens-dash package on your computer and [install requirements](#install-requirements). That is a template folder. After running the [build command](#link-the-sd-model-and-build) it will become the app folder specific to your sd project. Once you interface is built, you can [start](#-start-the-app) the app to customise the interface. 
Finally you can just [show](#view-end-product) it to the end user.

### Intall requirements
Clone the repo somewhere locally on your machine and install requirements:
```bash
npm install
```

### Link the SD model and build
The next step is configure your app and build it. The first time you build though, you must inform vens-dash where to find the "sd" directory, which is the directory on your computer containing your sd model and the compiled web files. You can do that by:

```bash
npm run build "\Path\to\your\sd\model.mdl"
```
[Here](sd_path.md) you can learn more about what is a valid SD folder and alternative ways to link it to your app.

### Start the app
```bash
npm start
```
This would launch the app in designer mode, meaning that you will be able customise its content (like which sliders or charts to show). If you want to see the dashboard as an end user, run the next command in [view mode](#view-end-product).

### Re-launch after changes
After you initialized the app for the [first time](#link-the-sd-model), you do not need to specify the .mdl location each time. So you can run ```npm run build``` if you changed the model, or ```npm start``` to restart the server. You can also combine the two in one command:

```bash
npm run build-start
```

### View end product
Finally you migh want to see the interface how the end user would see it:
```bash
npm run view
```

### Reset UI
To reset the UI elements of the dashboard you can run:
```bash
npm run reset
```
This command will delete data about: sliders and charts on the dashboard, setup inputs and runs.


## Deployment
Once you [built](#Link-the-SD-model-and-build) and [configured](#Start-the-app) your dashboard, you can now shut down the server (either Ctr+C or close terminal window) and deploy the dashboard as a Docker container. To simulate locally, you can simply run:

```bash
docker-compose up
```
For this command to run you need Docker installed and you need to make sure other proccess are not running on port 3000 (for example you will need to kill the `npm start` process if still running).

If you modify again your dashboard and want to make sure your next container will be up to date, you should run:

```bash
docker-compose down && docker-compose build --no-cache && docker-compose up
```

The deployed app, is intended for the final user and therefor will run in [viewMode](#View-end-product), which means that it would freeze the dashboard the way you configured it the last time and you won't be able to change it (unless you change it offline and re-deploy).

## Limitations

Being built on top of the Vensim Web folder, this app has same limitation as for the models complexity it can support. It supports all functiona and subscript, but not read from file or optimization for example. For the same reason, the graphs that can be visualized as of now are just one-variable line graphs, not bar charts or stack graphs for example.

## Possible developments
The Vensim Dashboard generator is still work in progress. Apart from fixing [bugs](bugs.md), next features to add:
* automated tests
* capability to reorder elements (sliders, charts, tabs, setup-inputs)
* capability to compare variables in the same graph (for a singular scenario)
* capability to use alternative visualizations other than just line charts
* causal tracing of variables
* capability to drag element or personalize layouts
* capability to draw diagrams on the page
