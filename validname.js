const validName = rawName => {
    const name = rawName
    .replace(/[\\/?%*:|"<>\.]/g,"-")
    .replace(/^-+|-+$/g,"");
    return name;
}
module.exports = validName;