from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any
from core.database import get_db
from models.user import User, Profile
from schemas.user import UserOut, ProfileCreate, ProfileOut
from core.deps import get_current_user

router = APIRouter()

@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)) -> Any:
    return current_user

@router.put("/profile", response_model=ProfileOut)
def update_profile(*, db: Session = Depends(get_db), profile_in: ProfileCreate, current_user: User = Depends(get_current_user)) -> Any:
    profile = current_user.profile
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
    for field, value in profile_in.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile
