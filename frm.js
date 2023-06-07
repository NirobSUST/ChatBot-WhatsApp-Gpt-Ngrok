require('dotenv').config();

const https = require('https');
const fss = require('fs');
const axios = require('axios');
const fs = require('fs');

const projectId = process.env.projectId;//"bs-bl-291005";
const location = process.env.location;//"us";
const processorId = process.env.processorId;//"de3ba99676bd6dc4";
process.env.GOOGLE_APPLICATION_CREDENTIALS = 'C:\\Users\\BS505\\AppData\\Local\\Packages\\PythonSoftwareFoundation.Python.3.10_qbz5n2kfra8p0\\LocalCache\\Roaming\\gcloud\\application_default_credentials.json';

const {DocumentProcessorServiceClient} = require('@google-cloud/documentai').v1beta3;

async function onlineProcess(projectId, location, processorId, filePath, mimeType) {
  const client = new DocumentProcessorServiceClient();

  const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;
  
  // Read the file into memory.
  const fs = require('fs').promises;
  const fileData = await fs.readFile(filePath);
  // Convert the image data to a Buffer and base64 encode it.
  const encodedImage = Buffer.from(fileData).toString('base64');

  const request = {
    name,
    document: {
      mimeType,
      content: encodedImage,
    },
  };
  
  const [response] = await client.processDocument(request);
  return response.document;
}

function trimText(text) {
  return text.trim().replace('\n', ' ');
}

function downloadFile(url, filePath) {
    return axios({
      method: 'get',
      url: url,
      responseType: 'stream'
    })
    .then(function(response) {
      return new Promise((resolve, reject) => {
        response.data.pipe(fs.createWriteStream(filePath))
        .on('finish', () => resolve('Downloaded the file successfully'))
        .on('error', e => reject(e));
      });
    })
    .catch(function (error) {
      console.log('Error while downloading the file', error.message);
    });
  }

function deleteFile(filePath) {
    return new Promise((resolve, reject) => {
      fss.unlink(filePath, (err) => {
        if (err) {
          console.error('Error while deleting the file', err);
          reject(err);
          return;
        }
        console.log('File deleted successfully');
        resolve();
      });
    });
  }


async function docprocess(urlPath)//(filePath, mimeType)//
{
    const url=urlPath;
    const file='C:/Users/BS505/Documents/GitHub/testbot-image/image.jpeg';//C:\Users\BS505\Documents\GitHub\testbot-image\image.jpg
    const mime= 'Image/jpeg';

    await downloadFile(url,file).then(console.log).catch(console.error);
    
   try{
    const document = await onlineProcess(projectId, location, processorId, file, mime)
    const names = [];
    const values = [];
        
    let customer, bill, month, amount;

    for (let page of document.pages) {
        for (let field of page.formFields) {
            names.push(trimText(field.fieldName.textAnchor.content));
            values.push(trimText(field.fieldValue.textAnchor.content));
        }
    }
    
    const data = names.map((name, index) => {
        return {
            "Field Name": name,
            "Field Value": values[index]
            };
        });
    
            customer = data.find(item => item['Field Name'] === 'CUSTOMER NO.');
            customer = customer ? customer : "Customer name not found";

            bill= data.find(item => item['Field Name'] === 'BILL NO');
            bill = bill ? bill : "Bill number not found";

            month = data.find(item => item['Field Name'] === 'MONTH');
            month = month ? month : "Month not found";

            amount = data.find(item => item['Field Name'] === 'TOTAL AMOUNT TO BE PAID');
            amount = amount ? amount : "Amount not found";
            
            // console.log(customer, bill, month, amount);
            
            return {customer, bill, month, amount};
   }catch(error){
    console.log(error);
   }
    
   await deleteFile(file);

    // return amount;
}

module.exports = docprocess;    
