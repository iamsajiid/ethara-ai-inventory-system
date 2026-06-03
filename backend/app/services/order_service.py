from sqlalchemy.orm import Session
from app.models.models import Order, OrderItem, Product, Customer
from app.schemas.order_schema import OrderCreate, OrderStatus
from app.exceptions import NotFoundError, BadRequestError


class OrderService:

    @staticmethod
    def create_order(db: Session, order_data: OrderCreate) -> Order:
        # 1. Validate customer
        customer = db.query(Customer).filter(Customer.id == order_data.customer_id).first()
        if not customer:
            raise NotFoundError("Customer", order_data.customer_id)

        # 2. Validate products and stock
        resolved_items = []
        for item in order_data.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if not product:
                raise NotFoundError("Product", item.product_id)
            if product.quantity < item.quantity:
                raise BadRequestError(
                    f"Insufficient stock for product '{product.name}'. "
                    f"Requested: {item.quantity}, Available: {product.quantity}"
                )
            resolved_items.append((product, item.quantity))

        # 3. Calculate total
        total_amount = sum(product.price * qty for product, qty in resolved_items)

        # 4. Create order
        order = Order(
            customer_id=order_data.customer_id,
            total_amount=round(total_amount, 2),
            status=OrderStatus.pending,
        )
        db.add(order)
        db.flush()

        # 5. Create items and deduct stock atomically
        for product, quantity in resolved_items:
            order_item = OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=quantity,
                unit_price=product.price,
                subtotal=round(product.price * quantity, 2),
            )
            db.add(order_item)
            product.quantity -= quantity

        db.commit()
        db.refresh(order)
        return order

    @staticmethod
    def get_all_orders(db: Session, status: str | None = None) -> list[Order]:
        query = db.query(Order)
        if status:
            query = query.filter(Order.status == status)
        return query.order_by(Order.created_at.desc()).all()

    @staticmethod
    def get_order_by_id(db: Session, order_id: int) -> Order:
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise NotFoundError("Order", order_id)
        return order

    @staticmethod
    def fulfill_order(db: Session, order_id: int) -> Order:
        order = OrderService.get_order_by_id(db, order_id)

        if order.status == OrderStatus.fulfilled:
            raise BadRequestError(f"Order #{order_id} is already fulfilled")

        if order.status == OrderStatus.cancelled:
            raise BadRequestError(f"Order #{order_id} has been cancelled and cannot be fulfilled")

        order.status = OrderStatus.fulfilled
        db.commit()
        db.refresh(order)
        return order

    @staticmethod
    def delete_order(db: Session, order_id: int) -> Order:
        order = OrderService.get_order_by_id(db, order_id)

        if order.status == OrderStatus.fulfilled:
            raise BadRequestError(
                f"Order #{order_id} is already fulfilled and cannot be cancelled. "
                "Contact support if this was a mistake."
            )

        if order.status == OrderStatus.cancelled:
            raise BadRequestError(f"Order #{order_id} is already cancelled")

        for item in order.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product:
                product.quantity += item.quantity

        order.status = OrderStatus.cancelled
        db.commit()
        db.refresh(order)
        return order