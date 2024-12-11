from flask import Flask, jsonify, request
from flask_cors import CORS
from langchain_community.llms import CTransformers
from langchain.prompts import PromptTemplate
import logging

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

# Configure logging to save logs in a more structured way (optional)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Initialize the CTransformers model globally (loaded only once)
MODEL_PATH = r"D:/ps project/backend/codellama-7b-instruct.Q4_K_M.gguf"
llm = None  # Initialize as None, will load later
model_config = {'max_new_tokens': 500, 'temperature': 0.01}

def load_model():
    global llm
    if llm is None:
        logging.info("Loading CodeLLaMA model...")
        llm = CTransformers(model=MODEL_PATH, model_type='llama', config=model_config)
        logging.info("Model loaded successfully.")
    return llm

# Define function to get response from CodeLLaMA model
def get_llama_response(input_text, time_complexity, language):
    try:
        logging.info("Generating code with CodeLLaMA model.")

        # Prepare prompt template
        template = (
            "Generate code for description:\n\n"
            "Description: '{input_text}'\n\n"
            "Time Complexity: {time_complexity}\n\n"
            "in Programming Language: {language}\n\n"
        )

        # Create the PromptTemplate
        prompt = PromptTemplate(input_variables=["input_text", "time_complexity", "language"], template=template)

        # Format the prompt
        formatted_prompt = prompt.format(input_text=input_text, time_complexity=time_complexity, language=language)
        logging.debug(f"Formatted Prompt: {formatted_prompt}")

        # Generate response from model
        model = load_model()
        response = model.invoke(formatted_prompt)
        
        if not response:
            raise ValueError("Model returned an empty response")

        return response

    except Exception as e:
        logging.error(f"Error interacting with CodeLLaMA model: {str(e)}")
        raise

# Define route to generate code
@app.route('/generate', methods=['POST'])
def generate_response():
    try:
        # Log incoming request
        logging.info("POST request received at /generate")
        data = request.json
        input_text = data.get('input_text')
        time_complexity = data.get('timeComplexity')
        language = data.get('language')

        # Debugging the inputs (avoid excessive logging in production)
        logging.debug(f"Received data: {input_text}, {time_complexity}, {language}")

        # Get the response from the model
        response = get_llama_response(input_text, time_complexity, language)

        # Return the generated code
        logging.info("Response generated successfully.")
        return jsonify({'response': response}), 200

    except Exception as e:
        error_message = f"Error in processing request: {str(e)}"
        logging.error(error_message)
        return jsonify({'error': error_message}), 500

# Run the Flask app
if __name__ == '__main__':
    logging.info("Starting Flask server on http://127.0.0.1:5000")
    app.run(debug=True)
