from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from models.bid import BidStatus

class BidBase(BaseModel):
    offer_price: float

class BidCreate(BidBase):
    crop_id: int

class BidUpdateStatus(BaseModel):
    status: BidStatus

class BidOut(BidBase):
    id: int
    crop_id: int
    buyer_id: int
    status: BidStatus
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True
