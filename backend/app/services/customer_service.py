from sqlalchemy.orm import Session
from app.models.models import Customer
from app.schemas.customer_schema import CustomerCreate
from app.exceptions import NotFoundError, ConflictError


class CustomerService:

    @staticmethod
    def create_customer(db: Session, customer_data: CustomerCreate) -> Customer:
        existing = db.query(Customer).filter(
            Customer.email == customer_data.email
        ).first()
        if existing:
            raise ConflictError(f"Customer with email '{customer_data.email}' already exists")

        customer = Customer(**customer_data.model_dump())
        db.add(customer)
        db.commit()
        db.refresh(customer)
        return customer

    @staticmethod
    def get_all_customers(db: Session) -> list[Customer]:
        return db.query(Customer).all()

    @staticmethod
    def get_customer_by_id(db: Session, customer_id: int) -> Customer:
        customer = db.query(Customer).filter(Customer.id == customer_id).first()
        if not customer:
            raise NotFoundError("Customer", customer_id)
        return customer

    @staticmethod
    def delete_customer(db: Session, customer_id: int) -> dict:
        customer = CustomerService.get_customer_by_id(db, customer_id)
        db.delete(customer)
        db.commit()
        return {"message": f"Customer '{customer.full_name}' deleted successfully"}