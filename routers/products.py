from fastapi import APIRouter, HTTPException, Depends,status
from app.database import get_db
from app import models
from app import schemas
from typing import List, Optional
from app.oauth2 import get_current_user

router = APIRouter(
    prefix="/products",
    tags=["products"]
)

@router.get("/",response_model=List[schemas.ProductResponse],status_code=status.HTTP_200_OK)
async def get_products(db=Depends(get_db),search:Optional[str] = "",
                       current_user: schemas.TokenData = Depends(get_current_user)):
    products = db.query(models.Product).filter(models.Product.name.contains(search)).all()
    return products

@router.get("/low_stock", response_model=List[schemas.ProductResponse])
async def get_low_stock_products(threshold: int = 5, db=Depends(get_db), current_user=Depends(get_current_user)):
    products = db.query(models.Product).filter(models.Product.quantity <= threshold).all()
    return products


@router.get("/{product_id}",status_code= status.HTTP_200_OK,response_model=schemas.ProductResponse)
async def get_product_by_id(product_id: int, db=Depends(get_db),
                            current_user: schemas.TokenData = Depends(get_current_user)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


@router.post("/",status_code=status.HTTP_201_CREATED,response_model=schemas.ProductResponse)
async def create_product(product: schemas.ProductRequest, db=Depends(get_db),
                         current_user: schemas.TokenData = Depends(get_current_user)):
    new_product = models.Product(**product.model_dump(exclude_unset=True), owner_id=current_user.user_id)
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@router.put("/{product_id}",status_code=status.HTTP_200_OK,response_model=schemas.UpdatedProductRequest)
async def update_product(product_id: int, product: schemas.ProductRequest, db=Depends(get_db),
                         current_user: schemas.TokenData = Depends(get_current_user)):
    updated_product = db.query(models.Product).filter(models.Product.id == product_id).first()

    if updated_product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    if updated_product.owner_id != current_user.user_id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this product")

    for key, value in product.model_dump(exclude_unset=True).items():
        setattr(updated_product, key, value)

    db.commit()
    db.refresh(updated_product)
    return updated_product

@router.patch("/{product_id}/increase", status_code=status.HTTP_200_OK,
              response_model=schemas.ProductResponse)
async def increase_stock(product_id:int,
                         request: schemas.IncreaseDecreaseStock,
                         db=Depends(get_db),
                         current_user: schemas.TokenData = Depends(get_current_user)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    if product.owner_id != current_user.user_id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this product")
    product.quantity += request.amount
    db.commit()
    db.refresh(product)
    return product

@router.patch("/{product_id}/decrease", status_code=status.HTTP_200_OK,
              response_model=schemas.ProductResponse)
async def decrease_stock(product_id:int,
                         request: schemas.IncreaseDecreaseStock,
                         db=Depends(get_db),
                         current_user: schemas.TokenData = Depends(get_current_user)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    if product.owner_id != current_user.user_id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this product")
    if product.quantity < request.amount:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient stock to decrease")
    product.quantity -= request.amount
    db.commit()
    db.refresh(product)
    return product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: int, db=Depends(get_db),
                         current_user: schemas.TokenData = Depends(get_current_user),
                         ):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    print("current_user_role:", current_user.role)

    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    if product.owner_id != current_user.user_id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this product")

    db.delete(product)
    db.commit()