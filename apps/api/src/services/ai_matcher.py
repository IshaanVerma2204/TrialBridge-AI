import os
from typing import Any

from fastembed import TextEmbedding
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, PointStruct, VectorParams

# Initialize Qdrant locally in the .qdrant_data folder to avoid needing Docker
qdrant_path = os.path.join(os.path.dirname(__file__), "..", "..", ".qdrant_data")
qdrant = QdrantClient(path=qdrant_path)
embedding_model = TextEmbedding("BAAI/bge-small-en-v1.5") # Lightweight, very fast local model

COLLECTION_NAME = "clinical_trials"

def init_qdrant():
    """Ensure the collection exists in Qdrant."""
    collections = qdrant.get_collections().collections
    if not any(c.name == COLLECTION_NAME for c in collections):
        # bge-small-en-v1.5 has 384 dimensions
        qdrant.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=384, distance=Distance.COSINE),
        )

def embed_and_store_trials(trials: list[dict[str, Any]]):
    """Generates embeddings for trials and stores them in Qdrant."""
    if not trials:
        return
        
    init_qdrant()
    
    # Create the text strings to embed (we combine inclusion/exclusion criteria)
    texts_to_embed = [
        f"Title: {t['title']}. Inclusion Criteria: {t['inclusion_criteria']}"
        for t in trials
    ]
    
    # Generate embeddings
    embeddings = list(embedding_model.embed(texts_to_embed))
    
    # Create Qdrant points
    points = []
    for i, trial in enumerate(trials):
        points.append(
            PointStruct(
                id=i, # Use simple integer ID for now, in prod we hash NCTId to uuid
                vector=embeddings[i].tolist(),
                payload={
                    "nct_id": trial["nct_id"],
                    "title": trial["title"],
                    "status": trial["status"],
                    "location": trial["location"]
                }
            )
        )
        
    # Upload to Qdrant
    qdrant.upsert(
        collection_name=COLLECTION_NAME,
        points=points
    )

def find_matches_for_patient(patient: Any, limit: int = 5) -> list[dict[str, Any]]:
    """Generates an embedding for a patient's profile and searches Qdrant for matching trials."""
    init_qdrant()
    
    # Create the patient's clinical profile string
    patient_text = f"Age: {patient.age}. Conditions: {patient.conditions}. Genes: {patient.genes}. History: {patient.medical_history}"
    
    # Generate embedding
    query_vector = next(iter(embedding_model.embed([patient_text]))).tolist()
    
    # Search Qdrant
    search_result = qdrant.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector,
        limit=limit
    )
    
    # Format the results
    matches = []
    for hit in search_result.points:
        matches.append({
            "nct_id": hit.payload.get("nct_id"),
            "title": hit.payload.get("title"),
            "status": hit.payload.get("status"),
            "location": hit.payload.get("location"),
            "compatibility_score": str(round(hit.score * 100, 2)),
            "explanation": "Matched based on semantic similarity of medical profile to trial criteria."
        })
        
    return matches
