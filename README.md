# Create Vensim Dashboard

This app creates an app that serves a basic dashboard for a Vensim System Dynamics model, that can be consumed via browser.

# How to use
Decide a name for your app (like *my-sd-model-dash*) and run the following command to create a new subdirectory containg your app.

```bash
npx create-vens-dash my-sd-model-dash
cd my-sd-model-dash
npm install
npm run build-start "./path/to/sd/model"
```

# Requirements
For the `npm run build-start` command to work, you need to compile the Vensim model into WebAssembly first. [This functionality](#https://www.vensim.com/documentation/publishing-a-model-to-the-inte.html) is available from version 8.1 of Vensim.