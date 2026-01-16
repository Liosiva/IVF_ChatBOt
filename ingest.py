import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
import re

DATA_DIR = r"C:\Users\gatta\Downloads\Project_306\code_part\data"
DB_DIR = r"C:\Users\gatta\Downloads\Project_306\code_part\vectorstore2"

documents = []

def clean_pdf_text(text: str) -> str:
    """
    Remove academic citation artifacts and reference sections
    while keeping medical meaning intact.
    """
    # Remove author–year citations like (Delvigne & Rozenberg, 2002)
    text = re.sub(r"\([A-Z][a-zA-Z&.\s]+,\s*\d{4}\)", "", text)

    # Remove numeric citations like [12], [3, 7]
    text = re.sub(r"\[\s*\d+(?:\s*,\s*\d+)*\s*\]", "", text)

    # Remove inline year-only brackets like (2005)
    text = re.sub(r"\(\d{4}\)", "", text)

    # Remove reference section headers and everything after
    text = re.sub(r"references*", "", text, flags=re.IGNORECASE | re.DOTALL)

    # Normalize whitespace
    text = re.sub(r"\s{2,}", " ", text)

    return text.strip()


for file in os.listdir(DATA_DIR):
    if file.lower().endswith(".pdf"):
        loader = PyPDFLoader(os.path.join(DATA_DIR, file))
        docs = loader.load()
        for d in docs:
            d.page_content = clean_pdf_text(d.page_content)
            d.metadata["source"] = file
        documents.extend(docs)

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=100
)

chunks = splitter.split_documents(documents)

embeddings = HuggingFaceEmbeddings(
    model_name="BAAI/bge-base-en-v1.5",
    encode_kwargs={"normalize_embeddings": True}
)

db = FAISS.from_documents(chunks, embeddings)
db.save_local(DB_DIR)

print(f"✅ Vector DB built with {len(chunks)} chunks")