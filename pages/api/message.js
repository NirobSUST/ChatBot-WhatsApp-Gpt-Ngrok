import {
    Configuration,
    OpenAIApi
} from "openai";
import axios  from "axios";
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openAI = new OpenAIApi(configuration);
export default async function handler(req, res) {
    const MessagingResponse = require('twilio').twiml.MessagingResponse;
    var messageResponse = new MessagingResponse();
    console.log(req.body);
    const sentMessage = req.body.Body || '';
    let replyToBeSent = "";
    if (sentMessage.trim().length === 0) {
        replyToBeSent = "We could not get your message. Please try again";
    } else {
        // try {
            // const completion = await openAI.createCompletion({
            //     model: "text-davinci-003", // required
            //     prompt: req.body.Body, // completion based on this
            //     temperature: 0.6, //
            //     n: 1,
            //     max_tokens: 500,
                        // });
            // replyToBeSent = completion.data.choices[0].text 
            const response = await axios.post(`http://127.0.0.1:5000/generate`, {
                prompt: req.body.Body
            })
            // console.log(response.data.generated_text.output)
            replyToBeSent = response.data.generated_text.output
            console.log(replyToBeSent)
        // } catch (error) {
        //     if (error.response) {
        //         console.log(error.response)
        //         replyToBeSent = "There was an issue with the server"
        //     } else { // error getting response
        //         replyToBeSent = "An error occurred during your request.";
        //     }
        // }
    }
    messageResponse.message(replyToBeSent);
    // send response
    res.writeHead(200, {
        'Content-Type': 'text/xml'
    });
    res.end(messageResponse.toString());
}
