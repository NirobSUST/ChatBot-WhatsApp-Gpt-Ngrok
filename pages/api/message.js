import {
    Configuration,
    OpenAIApi
} from "openai";
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openAI = new OpenAIApi(configuration);
const docprocess = require('../../frm');

export default async function handler(req, res) {
    const MessagingResponse = require("twilio").twiml.MessagingResponse;
    const messageResponse = new MessagingResponse();
  
    const sentMessage = req.body.Body || "";
  
    // Check if the received message contains an image
    let replyToBeSent = "";
    if (req.body.MediaUrl0) {
      // Save the image URL in memory
      const filePath = req.body.MediaUrl0;
      console.log(filePath);
      const result = await docprocess(filePath);
      
      replyToBeSent=`Image received and saved successfully.
      ${result.customer['Field Name']}: ${result.customer['Field Value']}, 
      ${result.bill['Field Name']} : ${result.bill['Field Value']},
      ${result.month['Field Name']} : ${result.month['Field Value']}, 
      ${result.amount['Field Name']} : ${result.amount['Field Value']}`
    } 
    else {
      if (sentMessage.trim().length === 0) {
        replyToBeSent = "We could not get your message. Please try again";
      } 
      else {
        try {
          const completion = await openAI.createCompletion({
            model: "text-davinci-003",
            prompt: sentMessage,
            temperature: 0,
            n: 1,
            max_tokens: 1000,
          });
  
          replyToBeSent = completion.data.choices[0].text;
        } 
        catch (error) {
          if (error.response) {
            console.log(error.response);
            replyToBeSent = "There was an issue with the server";
          } 
          else {
            replyToBeSent = "An error occurred during your request.";
          }
        }
      }
    }
    console.log(replyToBeSent);
    messageResponse.message(replyToBeSent);
    
    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(messageResponse.toString());
  }