const path = require('path');
const fs = require('fs');
const envPath = path.resolve(__dirname, './../.env');
// const env = require('dotenv').config({path: envPath});
// if (env && env.error) throw env.error;

/** utility to update one env variable in current and future sessions (by saving on .env) */
const updateOne = (key, val) => {
    const content = fs.existsSync(envPath)? fs.readFileSync(envPath, 'utf8') : "";
    const newContent = content.includes(key)?
        content.split(/\r\n|\r|\n/)
            .map(line => line.includes(key)?
                `${key}=${val}`
                :line)
            .join('\n')
        :(content+`\n${key}=${val}`);
    try {
        fs.writeFileSync(envPath, newContent, 'utf8');
        // console.log(`.env.${key} = ${val}`);
        process.env[key] = val;
    } catch (err) {
        console.error(err);
    }
};

/** utility to update env variables in current and future sessions (by saving on .env) */
const updateEnv = obj => {
    for (let [key, val] of Object.entries(obj)){
        updateOne(key,val);
    }
};

module.exports = updateEnv;