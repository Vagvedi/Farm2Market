from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, List
from core.database import get_db
from models.order import Order, OrderStatus
from models.crop import Crop
from models.bid import Bid
from models.user import User
from schemas.order import OrderCreate, OrderOut, OrderStatusUpdate
from core.deps import get_current_user, get_current_farmer

router = APIRouter()

@router.post("/", response_model=OrderOut)
def create_order(*, db: Session = Depends(get_db), order_in: OrderCreate, current_user: User = Depends(get_current_user)) -> Any:
    if current_user.role.value == "FARMER":
         raise HTTPException(status_code=400, detail="Farmers cannot buy crops")
         
    crop = db.query(Crop).filter(Crop.id == order_in.crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
        
    if crop.quantity < order_in.quantity:
        raise HTTPException(status_code=400, detail="Not enough crop quantity available")
        
    final_price = crop.price
    if order_in.bid_id:
        bid = db.query(Bid).filter(Bid.id == order_in.bid_id).first()
        if bid and bid.status.value == "ACCEPTED":
             final_price = bid.offer_price
             
    # Create order
    order = Order(
        crop_id=crop.id,
        buyer_id=current_user.id,
        final_price=final_price,
        quantity=order_in.quantity
    )
    db.add(order)
    
    # Deduct quantity
    crop.quantity -= order_in.quantity
    
    db.commit()
    db.refresh(order)
    return order

@router.get("/my-orders", response_model=List[OrderOut])
def read_my_orders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> Any:
    if current_user.role.value == "FARMER":
        # Get orders for farmer's crops
        orders = db.query(Order).join(Crop).filter(Crop.farmer_id == current_user.id).all()
        return orders
    else:
        # Get buyer orders
        orders = db.query(Order).filter(Order.buyer_id == current_user.id).all()
        return orders

@router.put("/{order_id}/status", response_model=OrderOut)
def update_order_status(*, db: Session = Depends(get_db), order_id: int, status_update: OrderStatusUpdate, current_user: User = Depends(get_current_farmer)) -> Any:
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    # Check if farmer owns the crop
    if order.crop.farmer_id != current_user.id:
         raise HTTPException(status_code=403, detail="Not permissions to update this order")
         
    order.status = status_update.status
    db.commit()
    db.refresh(order)
    return order
