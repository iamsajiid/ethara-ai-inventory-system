from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.models import Order, OrderItem, Product, Customer
from app.schemas.order_schema import OrderCreate


class OrderService:

    @staticmethod
    def create_order(db: Session, order_data: OrderCreate) -> Order:
        # 1. Validate customer
        customer = db.query(Customer).filter(Customer.id == order_data.customer_id).first()
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Customer with id {order_data.customer_id} not found"
            )

        # 2. Validate products and stock
        resolved_items = []
        for item in order_data.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product with id {item.product_id} not found"
                )
            if product.quantity < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Insufficient stock for product '{product.name}'. "
                        f"Requested: {item.quantity}, Available: {product.quantity}"
                    )
                )
            resolved_items.append((product, item.quantity))

        # 3. Calculate total (always server-side)
        total_amount = sum(product.price * qty for product, qty in resolved_items)

        # 4. Create order
        order = Order(
            customer_id=order_data.customer_id,
            total_amount=round(total_amount, 2),
            status="pending"
        )
        db.add(order)
        db.flush()  # get order.id without committing

        # 5. Create items and deduct stock atomically
        for product, quantity in resolved_items:
            order_item = OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=quantity,
                unit_price=product.price,
                subtotal=round(product.price * quantity, 2)
            )
            db.add(order_item)
            product.quantity -= quantity

        db.commit()
        db.refresh(order)
        return order

    @staticmethod
    def get_all_orders(db: Session) -> list[Order]:
        return db.query(Order).all()

    @staticmethod
    def get_order_by_id(db: Session, order_id: int) -> Order:
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with id {order_id} not found"
            )
        return order

    @staticmethod
    def delete_order(db: Session, order_id: int) -> dict:
        order = OrderService.get_order_by_id(db, order_id)

        # Restore inventory
        for item in order.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product:
                product.quantity += item.quantity

        db.delete(order)
        db.commit()
        return {"message": f"Order #{order_id} cancelled and inventory restored"}