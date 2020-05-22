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


const imageUpload = async (filePath, spacePath, fileName) => {
    console.log({ filePath, spacePath,fileName })

    // You can either "yarn add aws-sdk" or "npm i aws-sdk"


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

    // Ensure that you POST a base64 data to your server.
    // Let's assume the variable "base64" is one.
    const fileContent = fs.readFileSync(filePath);
    // const base64Data = new Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), 'base64');

    // Getting the file type, ie: jpeg, png or gif
    const type = filePath.split(".")[filePath.split(".").length - 1]
    // console.log({type})

    // Generally we'd have an userId associated with the image
    // For this example, we'll simulate one
    const userId = 1;

    // With this setup, each time your user uploads an image, will be overwritten.
    // To prevent this, use a different Key each time.
    // This won't be needed if they're uploading their avatar, hence the filename, userAvatar.js.
    const params = {
        Bucket: S3_BUCKET + "/" + spacePath,
        Key: `${fileName}`, // type is not required
        Body: fileContent,
        ACL: 'public-read',
        // ContentEncoding: 'base64', // required
        // ContentType: `image/${type}` // required. Notice the back ticks
    }

    // console.log(params)

    // The upload() is used instead of putObject() as we'd need the location url and assign that to our user profile/database
    // see: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property
    let location = '';
    let key = '';
    try {
        const { Location, Key } = await s3.upload(params).promise();
        location = Location;
        key = Key;
    } catch (error) {
        console.log(error)
    }

    // Save the Location (url) to your database and Key if needs be.
    // As good developers, we should return the url and let other function do the saving to database etc
    console.log(location, key);

    return location;

    // To delete, see: https://gist.github.com/SylarRuby/b3b1430ca633bc5ffec29bbcdac2bd52
}

module.exports = imageUpload;