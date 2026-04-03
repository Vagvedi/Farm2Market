from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import Any, List, Dict
from core.database import get_db, SessionLocal
from models.bid import Bid, BidStatus
from models.crop import Crop
from models.user import User
from schemas.bid import BidCreate, BidOut, BidUpdateStatus
from core.deps import get_current_user, get_current_farmer

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, crop_id: int, websocket: WebSocket):
        await websocket.accept()
        if crop_id not in self.active_connections:
            self.active_connections[crop_id] = []
        self.active_connections[crop_id].append(websocket)

    def disconnect(self, crop_id: int, websocket: WebSocket):
        if crop_id in self.active_connections:
            self.active_connections[crop_id].remove(websocket)

    async def broadcast(self, crop_id: int, message: str):
        if crop_id in self.active_connections:
            for connection in self.active_connections[crop_id]:
                await connection.send_text(message)

manager = ConnectionManager()

@router.websocket("/ws/{crop_id}")
async def websocket_endpoint(websocket: WebSocket, crop_id: int):
    await manager.connect(crop_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # In a real app, parse data and authenticate WS connection properly
    except WebSocketDisconnect:
        manager.disconnect(crop_id, websocket)

@router.post("/", response_model=BidOut)
async def create_bid(*, db: Session = Depends(get_db), bid_in: BidCreate, current_user: User = Depends(get_current_user)) -> Any:
    if current_user.role.value == "FARMER":
        raise HTTPException(status_code=400, detail="Farmers cannot bid on crops")
    
    crop = db.query(Crop).filter(Crop.id == bid_in.crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
        
    bid = Bid(
        crop_id=bid_in.crop_id,
        buyer_id=current_user.id,
        offer_price=bid_in.offer_price
    )
    db.add(bid)
    db.commit()
    db.refresh(bid)
    
    await manager.broadcast(crop_id=bid.crop_id, message=f"New bid of {bid.offer_price} placed!")
    return bid

@router.get("/crop/{crop_id}", response_model=List[BidOut])
def get_bids_for_crop(*, db: Session = Depends(get_db), crop_id: int, current_user: User = Depends(get_current_user)) -> Any:
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
        
    if current_user.role.value != "ADMIN" and crop.farmer_id != current_user.id and current_user.role.value != "BUYER":
        raise HTTPException(status_code=403, detail="Not permitted to view bids")
        
    bids = db.query(Bid).filter(Bid.crop_id == crop_id).all()
    return bids

@router.put("/{bid_id}/status", response_model=BidOut)
async def update_bid_status(*, db: Session = Depends(get_db), bid_id: int, status_update: BidUpdateStatus, current_user: User = Depends(get_current_farmer)) -> Any:
    bid = db.query(Bid).filter(Bid.id == bid_id).first()
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")
        
    crop = db.query(Crop).filter(Crop.id == bid.crop_id).first()
    if crop.farmer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the crop owner can update bid status")
        
    bid.status = status_update.status
    db.commit()
    db.refresh(bid)
    
    await manager.broadcast(crop_id=bid.crop_id, message=f"Bid status updated to {bid.status.value}!")
    return bid
