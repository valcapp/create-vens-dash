# Create Vensim Dashboard

This app creates an app that serves a basic dashboard for a Vensim System Dynamics model, that can be consumed via browser.

# How to use
Decide a name for your app (like *my-sd-model-dash*) and run the following command to create a new subdirectory containg your app.

```bash
npx create-vens-dash my-dash
cd my-dash
npm install
npm run init-start "./path/to/sd/model"
```

# Requirements
For the `npm run init-start` command to work, you need to compile the Vensim model into WebAssembly first. [This functionality](#https://www.vensim.com/documentation/publishing-a-model-to-the-inte.html) is available from version 8.1 of Vensim.

# Deployment
Once you have customized your dashboard, you are ready to deploy your dash directory. A simple example of how to deploy is Heroku. Install git and heroku cli (if not done already), login and run the following from your dash directory:

```
git init
git add .
git commit -m "first commit"
heroku create
git push heroku master
```