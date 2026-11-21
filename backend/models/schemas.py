"""Pydantic v2 models shared across the NexusResearch backend."""

# pyrefly: ignore [missing-import]
from pydantic import BaseModel, Field
from typing import Optional


class Source(BaseModel):
    id: str
    type: str  # "pdf" | "url" | "youtube"
    title: str
    chunk_count: int
    added_at: str


class IngestResponse(BaseModel):
    source: Source
    message: str


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    project_id: str
    message: str
    chat_history: list[ChatMessage] = Field(default_factory=list)


class Citation(BaseModel):
    source_id: str
    source_title: str
    source_type: str
    chunk_text: str


class UrlIngestRequest(BaseModel):
    project_id: str
    url: str


class YoutubeIngestRequest(BaseModel):
    project_id: str
    url: str


class Project(BaseModel):
    id: str
    name: str
    created_at: str
    user_id: Optional[str] = None


class ProjectMessage(BaseModel):
    id: str
    role: str
    content: str
    citations: list[Citation]
    created_at: str


# Authentication models
class UserRegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class UserLoginRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    created_at: str


class AuthResponse(BaseModel):
    token: str
    user: UserResponse
