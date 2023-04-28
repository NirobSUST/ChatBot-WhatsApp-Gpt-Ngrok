from flask import Flask, request, jsonify
import langchain_business
app = Flask(__name__)
conversational_agent = None

def generate_text(prompt, conversational_agent):
    input_ids = prompt #tokenizer.encode(prompt, return_tensors="pt")
    output = langchain_business.run(prompt, conversational_agent) #model.generate(input_ids, max_length=max_length, num_return_sequences=1)
    text = output #tokenizer.decode(output[0], skip_special_tokens=True)
    return text

@app.route("/generate", methods=["POST"])
def generate_endpoint():
    prompt = request.json.get("prompt", "")
    generated_text = generate_text(prompt, conversational_agent)
    return jsonify({"generated_text": generated_text})

if __name__ == "__main__":
    conversational_agent = langchain_business.initiation()
    app.run(debug=True)
