from fastapi import APIRouter
from api.v1.endpoints import auth, users, crops, bids, orders, admin

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(crops.router, prefix="/crops", tags=["crops"])
api_router.include_router(bids.router, prefix="/bids", tags=["bids"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
