from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from core.database import Base

class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), index=True, nullable=False)
    description = Column(String(1000), nullable=True)
    price = Column(Float, nullable=False)
    quantity = Column(Float, nullable=False) # e.g., kg, tons
    unit = Column(String(50), default="kg")
    image_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    farmer = relationship("User", back_populates="crops")
    bids = relationship("Bid", back_populates="crop", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="crop", cascade="all, delete-orphan")
