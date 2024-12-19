from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain.schema import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import GPT4AllEmbeddings
from dotenv import load_dotenv
import os
import logging

app = Flask(__name__)
CORS(app)
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

LANGCHAIN_API_KEY = os.getenv("LANGCHAIN_API_KEY")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
print(f"LangChain API Key: {LANGCHAIN_API_KEY}")
print(f"Google API Key: {GOOGLE_API_KEY}")

if not LANGCHAIN_API_KEY or not GOOGLE_API_KEY:
    raise ValueError("API keys for LangChain or Google are missing. Set them as environment variables.")

# Load the content of document.md and prepare it for querying
def load_documents() -> list[Document]:
    markdown_path = "/home/wissal/Desktop/web/AI-7J/AI-7j/7j/backend/src/document.md"
    try:
        with open(markdown_path, 'r', encoding='utf-8') as file:
            markdown_text = file.read()
        return [Document(page_content=markdown_text, metadata={'source': markdown_path})]
    except FileNotFoundError:
        logging.error(f"Document file not found: {markdown_path}")
        return []

def setup_retriever():
    docs = load_documents()
    if not docs:
        raise ValueError("No documents loaded. Please check the document path.")
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_documents(docs)
    vectorstore = Chroma.from_documents(
        documents=splits,
        embedding=GPT4AllEmbeddings(device="cpu", api_key=LANGCHAIN_API_KEY)  # Pass the LangChain API key
    )
    return vectorstore.as_retriever()

# Initialize retriever lazily
retriever = None

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'running', 'retriever_initialized': retriever is not None}), 200

@app.route('/chat', methods=['POST'])
def chat():
    global retriever
    data = request.get_json()
    logging.info(f"Received data: {data}")
    question = data.get('question')

    if not question:
        return jsonify({'error': 'No question provided'}), 400

      # Initialize retriever if not already done
    if retriever is None:
        try:
            retriever = setup_retriever()
        except ValueError as e:
            logging.error(e)
            return jsonify({'error': 'Retriever setup failed. Check logs for details.'}), 500

    docs = retriever.get_relevant_documents(question) if retriever else []
    logging.info(f"Found {len(docs)} relevant documents")

    reply = "\n".join([doc.page_content for doc in docs]) if docs else "I'm sorry, I couldn't find relevant information in the document."
    logging.info(f"Reply: {reply}")

    return jsonify({'reply': reply})

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5000)
