from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.order_schema import OrderCreate, OrderResponse
from app.services.order_service import OrderService

router = APIRouter()


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    """
    Create a new order.
    - Validates customer and product existence
    - Checks inventory availability
    - Auto-calculates total amount
    - Deducts stock on success
    """
    return OrderService.create_order(db, order)


@router.get("/", response_model=List[OrderResponse])
def get_all_orders(db: Session = Depends(get_db)):
    """Retrieve all orders."""
    return OrderService.get_all_orders(db)


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    """Retrieve order details by ID including all line items."""
    return OrderService.get_order_by_id(db, order_id)


@router.delete("/{order_id}")
def cancel_order(order_id: int, db: Session = Depends(get_db)):
    """Cancel/delete an order and restore inventory."""
    return OrderService.delete_order(db, order_id)