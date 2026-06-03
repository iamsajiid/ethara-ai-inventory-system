from sqlalchemy.orm import Session
from app.models.models import Product
from app.schemas.product_schema import ProductCreate, ProductUpdate
from app.exceptions import NotFoundError, ConflictError


class ProductService:

    @staticmethod
    def create_product(db: Session, product_data: ProductCreate) -> Product:
        existing = db.query(Product).filter(Product.sku == product_data.sku).first()
        if existing:
            raise ConflictError(f"Product with SKU '{product_data.sku}' already exists")

        product = Product(**product_data.model_dump())
        db.add(product)
        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def get_all_products(db: Session) -> list[Product]:
        return db.query(Product).all()

    @staticmethod
    def get_product_by_id(db: Session, product_id: int) -> Product:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise NotFoundError("Product", product_id)
        return product

    @staticmethod
    def update_product(db: Session, product_id: int, update_data: ProductUpdate) -> Product:
        product = ProductService.get_product_by_id(db, product_id)
        update_dict = update_data.model_dump(exclude_unset=True)

        if "sku" in update_dict and update_dict["sku"] != product.sku:
            existing = db.query(Product).filter(Product.sku == update_dict["sku"]).first()
            if existing:
                raise ConflictError(f"Product with SKU '{update_dict['sku']}' already exists")

        for key, value in update_dict.items():
            setattr(product, key, value)

        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def delete_product(db: Session, product_id: int) -> dict:
        product = ProductService.get_product_by_id(db, product_id)
        db.delete(product)
        db.commit()
        return {"message": f"Product '{product.name}' deleted successfully"}

    @staticmethod
    def get_low_stock_products(db: Session, threshold: int = 10) -> list[Product]:
        return db.query(Product).filter(Product.quantity <= threshold).all()