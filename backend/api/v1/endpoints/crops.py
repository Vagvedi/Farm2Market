from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, List
from core.database import get_db
from models.crop import Crop
from models.user import User
from schemas.crop import CropCreate, CropUpdate, CropOut
from core.deps import get_current_user, get_current_farmer, get_current_active_user

router = APIRouter()

@router.get("/", response_model=List[CropOut])
def read_crops(db: Session = Depends(get_db), skip: int = 0, limit: int = 100) -> Any:
    """Get all available crops for marketplace"""
    crops = db.query(Crop).filter(Crop.quantity > 0).offset(skip).limit(limit).all()
    return crops

@router.get("/my-crops", response_model=List[CropOut])
def read_my_crops(db: Session = Depends(get_db), current_user: User = Depends(get_current_farmer), skip: int = 0, limit: int = 100) -> Any:
    """Get crops created by the current farmer"""
    crops = db.query(Crop).filter(Crop.farmer_id == current_user.id).offset(skip).limit(limit).all()
    return crops

@router.post("/", response_model=CropOut, status_code=status.HTTP_201_CREATED)
def create_crop(*, db: Session = Depends(get_db), crop_in: CropCreate, current_user: User = Depends(get_current_farmer)) -> Any:
    crop = Crop(farmer_id=current_user.id, **crop_in.model_dump())
    db.add(crop)
    db.commit()
    db.refresh(crop)
    return crop

@router.put("/{crop_id}", response_model=CropOut)
def update_crop(*, db: Session = Depends(get_db), crop_id: int, crop_in: CropUpdate, current_user: User = Depends(get_current_farmer)) -> Any:
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    if crop.farmer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    for field, value in crop_in.model_dump(exclude_unset=True).items():
        setattr(crop, field, value)
    
    db.commit()
    db.refresh(crop)
    return crop

@router.delete("/{crop_id}")
def delete_crop(*, db: Session = Depends(get_db), crop_id: int, current_user: User = Depends(get_current_farmer)) -> Any:
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    if crop.farmer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    db.delete(crop)
    db.commit()
    return {"ok": True}
