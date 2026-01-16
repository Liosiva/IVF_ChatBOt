# rag.py

from langchain_community.vectorstores import FAISS
from langchain_huggingface.embeddings import HuggingFaceEmbeddings
from huggingface_hub import InferenceClient
import os
from config import VECTOR_DB_PATH, EMBEDDING_MODEL, MAX_NEW_TOKENS


print("🔹 Loading embeddings...")
embeddings = HuggingFaceEmbeddings(
    model_name=EMBEDDING_MODEL,
    encode_kwargs={"normalize_embeddings": True}
)

print("🔹 Loading FAISS DB...")
db = FAISS.load_local(
    VECTOR_DB_PATH,
    embeddings,
    allow_dangerous_deserialization=True
)

print("🔹 Loading Mistral-7B ...")

llm = InferenceClient(
    model ="mistralai/Mistral-7B-Instruct-v0.2",
    token =os.environ["HUGGINGFACEHUB_API_TOKEN"]
)


SYSTEM_PROMPT = """
You are an IVF patient support assistant.
Answer ONLY using the provided context.
Do NOT diagnose or prescribe.
Recommend consulting a fertility specialist.
Answers should be stright to question.dont't manupilate the answer.
For daily activity or lifestyle questions, prioritize patient education context over procedural IVF details.
Clearly give the user friendly answer.short and exact point.
"""


def generate_answer(user_query: str):

    docs = db.similarity_search(user_query, k=4)

    if not docs:
        return {
            "answer": "I don’t have enough information to answer this safely.",
            "sources": []
        }

    context = "\n\n".join(d.page_content for d in docs)
    sources = list(set(d.metadata.get("source", "Unknown") for d in docs))

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {
            "role": "user",
            "content": f"""
Context:
{context}

Question:
{user_query}
"""
        }
    ]

    response = llm.chat_completion(
        messages=messages,
        max_tokens= MAX_NEW_TOKENS,
        temperature=0.0
    )

    answer = response.choices[0].message["content"].strip()

    return {
        "answer": answer,
        "sources": sources
    }
