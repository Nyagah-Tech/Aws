/**
 * This gist was inspired from https://gist.github.com/homam/8646090 which I wanted to work when uploading an image from
 * a base64 string.
 * Updated to use Promise (bluebird)
 * Web: https://mayneweb.com
 *
 * @param  {string}  base64 Data
 * @return {string}  Image url
 */

const AWS = require('aws-sdk');
const bluebird = require('bluebird')
const fs = require("fs")

const { execSync } = require("child_process");

const gitCommand = "git rev-parse HEAD"

const getGitCommitHash = () => execSync(gitCommand).toString().trim()


const imageDownload = async (fileName) => {
    try {
         // Configure AWS with your access and secret key.
    const { ACCESS_KEY_ID, SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET } = process.env;
   
    // Configure AWS to use promise
    AWS.config.setPromisesDependency(bluebird);
    AWS.config.update({ accessKeyId: ACCESS_KEY_ID, secretAccessKey: SECRET_ACCESS_KEY, region: AWS_REGION });

    // Create an s3 instance
    // const s3 = new AWS.S3();
   

    const spacesEndpoint = new AWS.Endpoint('nyc3.digitaloceanspaces.com');
    const s3 = new AWS.S3({
        endpoint: spacesEndpoint
    });
    
    const params = {
        Bucket:S3_BUCKET,
        Key:fileName,
        // ContentEncoding: 'base64', // required
        // ContentType: `image/${type}` // required. Notice the back ticks
    }

    //getting the object from the bucket
    const response = await s3.getObject(params).promise()

    console.log(response)
    
    // creating a folder in your machine 
    // it assumes you have the ./download/
    var file = fs.createWriteStream(fileName)

    //write data we have fetched from the bucket to thefile we have created
    file.write(response.body)
    file.end()

    // To delete, see: https://gist.github.com/SylarRuby/b3b1430ca633bc5ffec29bbcdac2bd52
    } catch (error) {
        console.log('Download error',error)
    }
   
   
}

module.exports = imageDownload;
