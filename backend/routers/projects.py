# pyright: ignore [reportMissingImports]
import uuid
from typing import Optional
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, HTTPException, Depends
# pyrefly: ignore [missing-import]
from pydantic import BaseModel
from models.schemas import Project, ProjectMessage
from services.db import get_projects, create_project, get_messages
from services.vector_store import vector_store
from services.auth import get_current_user_payload

router = APIRouter(prefix="/projects", tags=["projects"])

class CreateProjectRequest(BaseModel):
    name: str

@router.get("", response_model=list[Project])
async def list_projects(payload: Optional[dict] = Depends(get_current_user_payload)):
    user_id = payload.get("sub") if payload else None
    return get_projects(user_id=user_id)

@router.post("", response_model=Project)
async def create_new_project(req: CreateProjectRequest, payload: Optional[dict] = Depends(get_current_user_payload)):
    project_id = uuid.uuid4().hex
    user_id = payload.get("sub") if payload else None
    return create_project(project_id, req.name, user_id=user_id)

@router.get("/{project_id}/messages", response_model=list[ProjectMessage])
async def list_project_messages(project_id: str):
    return get_messages(project_id)

@router.get("/{project_id}/sources")
async def list_project_sources(project_id: str) -> list[dict]:
    return vector_store.list_sources(project_id)
