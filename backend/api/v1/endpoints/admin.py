from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Any
from core.database import get_db
from models.user import User
from models.crop import Crop
from models.order import Order
from core.deps import get_current_admin
from sqlalchemy import func

router = APIRouter()

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)) -> Any:
    users_count = db.query(User).count()
    crops_count = db.query(Crop).count()
    orders_count = db.query(Order).count()
    total_sales = db.query(func.sum(Order.final_price * Order.quantity)).scalar() or 0.0
    
    return {
        "users": users_count,
        "crops": crops_count,
        "orders": orders_count,
        "total_revenue": total_sales
    }
