from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.schemas.order_schema import OrderCreate, OrderResponse, OrderFulfill, OrderStatus
from app.services.order_service import OrderService

router = APIRouter()


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    return OrderService.create_order(db, order)


@router.get("/", response_model=List[OrderResponse])
def get_all_orders(status: Optional[OrderStatus] = None, db: Session = Depends(get_db),):
    return OrderService.get_all_orders(db, status=status)


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    return OrderService.get_order_by_id(db, order_id)


@router.patch("/{order_id}/fulfill", response_model=OrderResponse)
def fulfill_order(order_id: int, _body: OrderFulfill = OrderFulfill(), db: Session = Depends(get_db),):
    return OrderService.fulfill_order(db, order_id)


@router.delete("/{order_id}", response_model=OrderResponse)
def cancel_order(order_id: int, db: Session = Depends(get_db)):
    return OrderService.delete_order(db, order_id)