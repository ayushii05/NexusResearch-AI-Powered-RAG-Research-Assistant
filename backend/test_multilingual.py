"""Verification test script for Multilingual (Hindi & English) support in NexusResearch."""

import sys
# pyrefly: ignore [missing-import]
import numpy as np

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from services.chunker import chunk_text
from services.nvidia_client import _build_system_prompt

def test_chunker():
    print("Testing Devanagari sentence boundary chunker...")
    hindi_text = (
        "नेक्सस रिसर्च एक बहुभाषी आरएजी प्लेटफॉर्म है। यह हिंदी और अंग्रेजी दोनों भाषाओं को समझता है। "
        "उपयोगकर्ता पीडीएफ अपलोड कर सकते हैं या यूट्यूब वीडियो लिंक जोड़ सकते हैं। "
        "यह शोधकर्ताओं के लिए एक बेहतरीन उपकरण है॥"
    )
    chunks = chunk_text(hindi_text, chunk_size=80, overlap=10)
    print(f"Chunk count: {len(chunks)}")
    for i, c in enumerate(chunks):
        print(f"  Chunk {i+1}: {c}")
    assert len(chunks) >= 2, "Should split Hindi text across sentences"
    print("✓ Chunker test passed!\n")

def test_system_prompt():
    print("Testing Multilingual System Prompt...")
    dummy_chunks = [
        {"source_title": "AI Research Paper", "source_type": "pdf", "chunk_text": "Transformer models are effective for cross-lingual tasks."},
        {"source_title": "हिंदी तकनीकी ब्लॉग", "source_type": "url", "chunk_text": "नेचुरल लैंग्वेज प्रोसेसिंग में बड़े भाषा मॉडल क्रांति ला रहे हैं।"}
    ]
    prompt = _build_system_prompt(dummy_chunks)
    assert "Hindi" in prompt and "English" in prompt, "Prompt should mention Hindi and English"
    assert "[Source: AI Research Paper]" in prompt or "AI Research Paper" in prompt, "Prompt should contain source titles"
    assert "LANGUAGE MATCHING" in prompt, "Prompt should enforce language matching"
    print("✓ Multilingual System Prompt test passed!\n")

def test_vector_store():
    print("Testing Multilingual Embedding Vector Store...")
    from services.vector_store import vector_store
    
    # Test embedding dimensions
    en_query = "What is the primary purpose of this research?"
    hi_query = "इस शोध का मुख्य उद्देश्य क्या है?"
    
    emb_en = vector_store._embed([en_query])[0]
    emb_hi = vector_store._embed([hi_query])[0]
    
    emb_en_norm = np.array(emb_en) / np.linalg.norm(emb_en)
    emb_hi_norm = np.array(emb_hi) / np.linalg.norm(emb_hi)
    
    cosine_sim = np.dot(emb_en_norm, emb_hi_norm)
    print(f"Dimension: {len(emb_en)}")
    print(f"Cross-lingual Cosine Similarity between English & Hindi equivalent questions: {cosine_sim:.4f}")
    assert len(emb_en) == 384, f"Expected 384 dimensions, got {len(emb_en)}"
    assert cosine_sim > 0.6, f"Expected high cross-lingual similarity (>0.6), got {cosine_sim}"
    print("✓ Multilingual Vector Store test passed!\n")

if __name__ == "__main__":
    test_chunker()
    test_system_prompt()
    test_vector_store()
    print("All multilingual unit tests PASSED successfully!")
