from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain.schema import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import GPT4AllEmbeddings
import os

app = Flask(__name__)
CORS(app)

# Load the content of document.md and prepare it for querying
def load_documents():
    markdown_path = "/home/wissal/Desktop/web/AI-7J/AI-7j/7j/backend/src/document.md"
    try:
        with open(markdown_path, 'r', encoding='utf-8') as file:
            markdown_text = file.read()
        return [Document(page_content=markdown_text, metadata={'source': markdown_path})]
    except FileNotFoundError:
        print(f"Error: {markdown_path} not found.")
        return []

def setup_retriever():
    docs = load_documents()
    if not docs:
        raise ValueError("No documents loaded. Please check the document path.")
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_documents(docs)
    vectorstore = Chroma.from_documents(documents=splits, embedding=GPT4AllEmbeddings(device="cpu"))
    return vectorstore.as_retriever()

# Initialize retriever
try:
    retriever = setup_retriever()
except ValueError as e:
    print(e)
    retriever = None

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    print(f"Received data: {data}")  # Log incoming request data
    question = data.get('question')

    if not question:
        return jsonify({'error': 'No question provided'}), 400

    if retriever:
        docs = retriever.get_relevant_documents(question)
        print(f"Found {len(docs)} relevant documents")  # Log number of docs found
    else:
        docs = []
        print("Retriever not available")  # Log if retriever is None

    reply = "\n".join([doc.page_content for doc in docs]) if docs else "I'm sorry, I couldn't find relevant information in the document."
    print(f"Reply: {reply}")  # Log the reply sent to the frontend

    return jsonify({'reply': reply})


if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5000)
