const path = require('path');
const fs = require('fs');
const envPath = path.resolve(__dirname, './../.env');
// const env = require('dotenv').config({path: envPath});
// if (env && env.error) throw env.error;

/** utility to update the .env file */
const updateEnv = (key, val) => {
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

module.exports = updateEnv;