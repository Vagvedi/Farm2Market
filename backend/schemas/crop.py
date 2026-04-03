from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CropBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    quantity: float
    unit: str = "kg"
    image_url: Optional[str] = None

class CropCreate(CropBase):
    pass

class CropUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    image_url: Optional[str] = None

class CropOut(CropBase):
    id: int
    farmer_id: int
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True
