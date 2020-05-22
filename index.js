require('dotenv').config()
const uploader = require("./uploader")
const git = require("git-last-commit")
const { promisify } = require("util")
const fs = require("fs")

const getCommit = promisify(git.getLastCommit)
const readDirFiles = promisify(fs.readdir)

const main = async () => {
    const { shortHash } = await getCommit()
    console.log(shortHash)
    // get the files in the upload dir 
    // HTML5
    const dirs = await readDirFiles("../exports/HTML5")
    console.log(dirs)

    dirs.map(file=>uploader(`../exports/HTML5/${file}`,`${shortHash}/HTML5`,`${file}`))
}

main()