
"""ChromaDB vector store using NVIDIA-hosted embeddings."""

import threading
from datetime import datetime, timezone

import chromadb

from services.nvidia_client import create_embeddings

_CHROMA_PATH = "./chroma_db"

# A separate collection is required because the new model
# produces 2048-dimensional vectors instead of 384.
_COLLECTION_NAME = "nexusresearch_nemotron35"

# Keep API requests small to control memory usage.
_BATCH_SIZE = 16


class VectorStore:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                instance = super().__new__(cls)
                instance._initialize()
                cls._instance = instance
        return cls._instance

    def _initialize(self) -> None:
        self._client = chromadb.PersistentClient(
            path=_CHROMA_PATH
        )

        self._collection = (
            self._client.get_or_create_collection(
                name=_COLLECTION_NAME,
                embedding_function=None,
                metadata={"hnsw:space": "cosine"},
            )
        )

        # No local ML model is loaded here.
        # Embeddings are generated through NVIDIA's API.

    def _embed(
        self,
        texts: list[str],
        input_type: str = "passage"
    ) -> list[list[float]]:

        return create_embeddings(
            texts,
            input_type=input_type
        )

    def add_source(
        self,
        project_id: str,
        source_id: str,
        source_title: str,
        source_type: str,
        chunks: list[str],
    ) -> int:

        if not chunks:
            return 0

        total_added = 0

        # Process chunks in small batches instead of
        # generating all embeddings in one large request.
        for start in range(0, len(chunks), _BATCH_SIZE):

            batch = chunks[start:start + _BATCH_SIZE]

            embeddings = self._embed(
                batch,
                input_type="passage"
            )

            ids = [
                f"{source_id}_chunk_{start + i}"
                for i in range(len(batch))
            ]

            added_at = datetime.now(
                timezone.utc
            ).isoformat()

            metadatas = [
                {
                    "project_id": project_id,
                    "source_id": source_id,
                    "source_title": source_title,
                    "source_type": source_type,
                    "chunk_index": start + i,
                    "added_at": added_at,
                }
                for i in range(len(batch))
            ]

            self._collection.add(
                ids=ids,
                # pyrefly: ignore[bad-argument-type]
                embeddings=embeddings,
                documents=batch,
                # pyrefly: ignore[bad-argument-type]
                metadatas=metadatas,
            )

            total_added += len(batch)

            # Release references to batch data.
            del embeddings

        return total_added

    def query(
        self,
        project_id: str,
        question: str,
        top_k: int = 5
    ) -> list[dict]:

        count = self._collection.count()

        if count == 0:
            return []

        query_embedding = self._embed(
            [question],
            input_type="query"
        )[0]

        result = self._collection.query(
            query_embeddings=[query_embedding],
            n_results=min(top_k, count),
            where={"project_id": project_id},
        )

        chunks = []

        documents = (
            # pyrefly: ignore[unsupported-operation]
            result.get("documents", [[]])[0]
            if result.get("documents")
            else []
        )

        metadatas = (
            # pyrefly: ignore[unsupported-operation]
            result.get("metadatas", [[]])[0]
            if result.get("metadatas")
            else []
        )

        distances = (
            # pyrefly: ignore[unsupported-operation]
            result.get("distances", [[]])[0]
            if result.get("distances")
            else []
        )

        for doc, meta, dist in zip(
            documents,
            metadatas,
            distances
        ):
            chunks.append({
                "chunk_text": doc,
                "source_id": meta.get("source_id"),
                "source_title": meta.get("source_title"),
                "source_type": meta.get("source_type"),
                "distance": dist,
            })

        return chunks

    def list_sources(
        self,
        project_id: str
    ) -> list[dict]:

        if self._collection.count() == 0:
            return []

        all_items = self._collection.get(
            include=["metadatas"],
            where={"project_id": project_id}
        )

        metadatas = all_items.get("metadatas", [])

        sources = {}

        # pyrefly: ignore[not-iterable]
        for meta in metadatas:

            source_id = meta.get("source_id")

            if source_id is None:
                continue

            if source_id not in sources:
                sources[source_id] = {
                    "id": source_id,
                    "type": meta.get("source_type"),
                    "title": meta.get("source_title"),
                    "chunk_count": 0,
                    "added_at": meta.get("added_at"),
                }

            sources[source_id]["chunk_count"] += 1

        return sorted(
            sources.values(),
            key=lambda s: s["added_at"] or "",
            reverse=True
        )


# One lightweight instance shared by the application.
vector_store = VectorStore()

