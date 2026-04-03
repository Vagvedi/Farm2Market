from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from models.order import OrderStatus

class OrderBase(BaseModel):
    quantity: float

class OrderCreate(OrderBase):
    crop_id: int
    bid_id: Optional[int] = None # Optional link to a bid if created from accepted bid
    
class OrderStatusUpdate(BaseModel):
    status: OrderStatus

class OrderOut(OrderBase):
    id: int
    crop_id: int
    buyer_id: int
    final_price: float
    status: OrderStatus
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class ReviewBase(BaseModel):
    rating: int
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    order_id: int

class ReviewOut(ReviewBase):
    id: int
    order_id: int
    reviewer_id: int
    reviewee_id: int
    created_at: datetime
    class Config:
        from_attributes = True
