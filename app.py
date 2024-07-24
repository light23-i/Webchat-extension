from bs4 import BeautifulSoup
import requests
from flask import Flask, request, jsonify
import google.generativeai as genai
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Initialize the generative model
model = genai.GenerativeModel(model_name='gemini-1.5-flash')
genai.configure(api_key=os.environ.get("gemini"))

# Function to extract and process the website content
def extract_content(response):
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Remove script and style tags
    for tag in soup(['script', 'style']):
        tag.decompose()
    
    # Get text from all visible elements
    all_text = soup.get_text(separator=' ', strip=True)
    
    return all_text

# Global variables
chat_context = None
last_url = None

# Initialize chat context for a given URL
def initialize_chat(url):
    global chat_context, last_url
    
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise exception for bad responses
        content = extract_content(response)
        
        if last_url != url:
            # Update prompts when URL changes
            prompt = f"The context for new conversation is {content}. The context is {content}. Please use {content} to answer queries. If asked about context use {content}. Answer content-specific questions based on the content, else use world knowledge."
        else:
            # Initial prompt setup
            prompt = f"The context for conversation is {content}. Answer content-specific questions based on the content, else use world knowledge."
        
        custom_history = [{
            "parts": [{"text": prompt}],
            "role": "user"
        }]
        
        chat_context = model.start_chat(history=custom_history)
        last_url = url  # Update last URL
        
        return True, "Chat context initialized."
    
    except requests.exceptions.RequestException as e:
        print(f"Error fetching URL: {e}")
        return False, "Failed to initialize chat context."

# Route to handle initial processing and subsequent queries
@app.route('/process', methods=['POST'])
def process():
    global chat_context
    
    data = request.json
    if 'url' in data:
        url = data['url']
        success, message = initialize_chat(url)
        if success:
            return jsonify({"message": message})
        else:
            return jsonify({"error": message}), 500
    
    if 'question' in data:
        if chat_context is None:
            return jsonify({"error": "Chat context not initialized."}), 400
        
        question = data['question']
        answer = get_chat_response(chat_context, question)
        print(answer)
        return jsonify({'answer': answer})
    
    else:
        return jsonify({"error": "Invalid request."}), 400

# Function to get response from chat model
def get_chat_response(chat, prompt):
    text_response = []
    responses = chat.send_message(prompt, stream=True)
    for chunk in responses:
        text_response.append(chunk.text)
    return "".join(text_response)

if __name__ == '__main__':
    app.run(port=5000)
