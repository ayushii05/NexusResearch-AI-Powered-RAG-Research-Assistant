# NexusResearch

 Multi-Source RAG Workspace. You drop in PDFs, web articles, and YouTube links. Local CPU embeddings index them into isolated project namespaces. An async FastAPI backend streams grounded, cited answers token-by-token from NVIDIA's Llama 3.1. No embedding API bills, and no context bleeding between projects.
 
🌐 **Live Demo:** https://nexus-research-ai-powered-rag-resea.vercel.app/

## The core idea

Most open-source "chat with your PDF" tools break down the moment real research starts — you're juggling a paper, three web articles, and a 40-minute YouTube walkthrough, and restarting the app wipes your session. NexusResearch treats research as a persistent, multi-source workspace instead of a disposable single-file upload.

**Ingest locally. → Retrieve strictly within the project. → Stream cited answers in real time.**

Concretely, every document and query moves through a five-stage pipeline:

1. **Tri-modal extraction** (`pdf_extractor.py`, `web_scraper.py`, `youtube_extractor.py`) pulls raw text from PDFs, web pages, or YouTube transcripts.

2. **Sentence-boundary chunking** (`chunker.py`) splits extracted text at sentence boundaries rather than arbitrary character cutoffs.

3. **On-device vectorization** generates 384-dimensional embeddings locally on CPU using `all-MiniLM-L6-v2` and persists them to ChromaDB tagged with the active `project_id`.

4. **Namespace-isolated retrieval** (`vector_store.py`) embeds the user prompt, queries ChromaDB strictly filtered by `project_id`, and attaches source metadata to the top matching chunks.

5. **Streaming synthesis** (`chat.py`, `nvidia_client.py`) streams `meta/llama-3.1-8b-instruct` responses token-by-token over Server-Sent Events (SSE), renders clickable inline citation chips in React (`ChatPanel.jsx`), and saves the turn to SQLite (`database.py`).

## What makes this different from "Chat with a PDF"

* **Three source types in one retrieval pass.** A single question pulls relevant chunks across PDFs, scraped web articles, and YouTube transcripts simultaneously — tagging claims with clickable citation chips that map back to each source.

* **Zero embedding API costs, local-first storage.** Vectorization runs entirely on-device via `sentence-transformers` (`all-MiniLM-L6-v2`), while ChromaDB and SQLite persist vectors, source metadata, projects, and chat history locally on disk.

* **Hard project isolation, not one giant bucket.** Every vector in ChromaDB is tagged with a `project_id`, and `vector_store.py` enforces that filter automatically on every retrieval query — switching workspaces never leaks context from another project.

* **Streaming-first, Gemini-inspired UI.** Built with React 18, Tailwind CSS, and Framer Motion: collapsing project sidebar, spring-animated document slide-over, inline `+` upload menu inside the chat bar, hover-to-copy markdown, dark/light theme toggle, and English/Hindi UI language support.

* **Honest about its own limits.** NexusResearch is built as a single-user, local-first workspace — not a multi-tenant cloud service. SQLite's file-level write locking and in-process ChromaDB aren't meant for concurrent multi-user traffic or stateless containers without a persistent volume. Local 384-dim CPU embeddings trade away some deep technical recall compared to large cloud embeddings with cross-encoder reranking, strict `project_id` isolation means there is no cross-project global search yet, and heavy PDF extraction currently shares the FastAPI process rather than running in a background worker queue.

## Ingestion sources

One workspace ingests three source types into the same retrieval pipeline:

| Source | Extractor | How it enters | Scope & caveats | 
| ----- | ----- | ----- | ----- | 
| **PDF** | `pypdf` (`pdf_extractor.py`) | Upload via inline `+` menu | Extracts text from standard PDFs; encrypted or image-only PDFs fail gracefully | 
| **Web Article** | `requests` + `BeautifulSoup4` (`web_scraper.py`) | Paste article URL | Static HTML parsing; client-side JS-rendered SPAs aren't executed | 
| **YouTube** | `youtube-transcript-api` (`youtube_extractor.py`) | Paste video URL | Pulls available video transcripts for cross-source querying | 

## Validation & boundaries

* **Request validation (`models/schemas.py`):** Pydantic models type-check every incoming FastAPI payload before it reaches extraction or persistence.

* **Workspace isolation (`services/vector_store.py`):** Active `project_id` metadata filters are injected server-side on every ChromaDB query so retrieval stays locked to the current project.

* **Safe rendering & secrets:** `react-markdown` strips unsafe script tags from scraped web content to prevent XSS, ChromaDB stays bound to localhost, and `NVIDIA_API_KEY` lives in `.env` (kept out of git via `.gitignore`).

## Running it locally

### Prerequisites

* Python 3.11+

* Node.js 18+

* A free [NVIDIA API key](https://build.nvidia.com/)

### 1. Backend

```
cd backend
python -m venv venv

# Activate virtual environment
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

pip install -r requirements.txt

# Configure environment variables
copy .env.example .env         # Windows
# cp .env.example .env         # macOS/Linux

```

Add your NVIDIA API key to `backend/.env`:

```
NVIDIA_API_KEY="nvapi-your-key-here"

```

Start the FastAPI server (SQLite initializes automatically via `main.py`):

```
uvicorn main:app --reload --port 8000

```

### 2. Frontend

In a second terminal:

```
cd frontend
npm install
npm run dev

```

Open `http://localhost:5173`, create a project, and click the **`+`** icon in the chat box to ingest your first PDF, article URL, or YouTube link.

## Stack

| Layer | Tech | 
| ----- | ----- | 
| **LLM** | NVIDIA NIM API — `meta/llama-3.1-8b-instruct` | 
| **Embeddings** | `sentence-transformers` (`all-MiniLM-L6-v2`), local CPU inference | 
| **Vector store** | ChromaDB — persistent local collection, filtered by `project_id` | 
| **Persistence** | SQLite — local relational store for projects, source trackers, and chat history | 
| **Backend** | FastAPI (Python 3.11), async Server-Sent Events (SSE) streaming, Pydantic | 
| **Extraction** | `pypdf`, `requests` + `BeautifulSoup4`, `youtube-transcript-api` | 
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion, Axios, `react-markdown`, `lucide-react` | 

## Project structure

```
nexusresearch/
├── backend/
│   ├── main.py                      # FastAPI app & SQLite initialization
│   ├── database.py                  # SQLite session management and schemas
│   ├── routers/
│   │   ├── projects.py              # CRUD for workspaces and chat history
│   │   ├── ingest.py                # PDF / URL / YouTube ingestion pipeline
│   │   └── chat.py                  # Streaming SSE chat endpoint with RAG context
│   ├── services/
│   │   ├── chunker.py               # Sentence-boundary-aware text splitting
│   │   ├── pdf_extractor.py         # PDF text extraction
│   │   ├── web_scraper.py           # Static web page scraping
│   │   ├── youtube_extractor.py     # YouTube transcript extraction
│   │   ├── vector_store.py          # ChromaDB wrapper with project_id isolation
│   │   └── nvidia_client.py         # NVIDIA NIM API client & system prompts
│   └── models/
│       └── schemas.py               # Pydantic validation models
└── frontend/
    └── src/
        ├── App.jsx                  # Layout, router, and page transitions
        └── components/
            ├── ProjectSidebar.jsx   # Collapsible Gemini-style navigation
            ├── ChatPanel.jsx        # SSE streaming interface & citation chips
            ├── UploadMenu.jsx       # Animated floating upload menu
            ├── SourcesSlideOver.jsx # Slide-out document tracker
            └── CreateProjectModal.jsx # In-page project creation flow

```

## What's next

* **Unified persistence:** Replace SQLite + local ChromaDB with PostgreSQL and `pgvector` for concurrent multi-user writes.

* **Background ingestion:** Move CPU-heavy extraction and embedding off the FastAPI event loop into a worker queue (Celery + Redis).

* **Richer retrieval:** Add a cross-encoder reranking step and an optional global-search toggle across workspaces.

* **Live ingestion telemetry:** Upgrade unidirectional SSE to WebSockets to stream real-time file processing progress.

Built by Ayushi Saini. Open source under the MIT License.
