from fastapi import APIRouter, HTTPException, Depends,status
from app.database import get_db
from app import models
from app import schemas
from typing import List, Optional
from app.oauth2 import get_current_user
from app.models import Log

router = APIRouter(
    prefix="/products",
    tags=["products"]
)

@router.get("/", response_model=List[schemas.ProductResponse], status_code=status.HTTP_200_OK)
async def get_products(
    db=Depends(get_db),
    search: Optional[str] = "",
    current_user: schemas.TokenData = Depends(get_current_user)
):
    query = db.query(models.Product)

    # Kullanıcı rolüne göre filtreleme
    if current_user.role == "user":
        query = query.filter(models.Product.owner_id == current_user.user_id)

    # Search parametresi varsa onu da filtrele
    if search:
        query = query.filter(models.Product.name.contains(search))

    products = query.all()

    if not products:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No products found")

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

    # In create_product endpoint, after commit & refresh:
    new_log = Log(
        user_id=current_user.user_id,
        action="create_product",
        entity="product",
        entity_id=new_product.id
    )
    db.add(new_log)
    db.commit()

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

    # In update_product endpoint, after commit & refresh:
    log = Log(
        user_id=current_user.user_id,
        action="update_product",
        entity="product",
        entity_id=updated_product.id
    )
    db.add(log)
    db.commit()

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

    # In increase_stock endpoint, after commit & refresh:
    log = Log(
        user_id=current_user.user_id,
        action="increase_stock",
        entity="product",
        entity_id=product.id
    )
    db.add(log)
    db.commit()

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

    # In decrease_stock endpoint, after commit & refresh:
    log = Log(
        user_id=current_user.user_id,
        action="decrease_stock",
        entity="product",
        entity_id=product.id
    )
    db.add(log)
    db.commit()

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

    # In delete_product endpoint, after db.delete & db.commit:
    log = Log(
        user_id=current_user.user_id,
        action="delete_product",
        entity="product",
        entity_id=product.id
    )
    db.add(log)
    db.commit()

@router.get("/paged", response_model=schemas.PagedProductsResponse, status_code=status.HTTP_200_OK)
async def get_products_paged(
    db=Depends(get_db),
    search: Optional[str] = "",
    page: int = 1,
    page_size: int = 10,
    sort_by: Optional[str] = "created_at",  # id | name | quantity | created_at | updated_at
    sort_dir: Optional[str] = "desc",       # asc | desc
    current_user: schemas.TokenData = Depends(get_current_user),
):
    if page < 1:
        page = 1
    if page_size < 1 or page_size > 100:
        page_size = 10

    query = db.query(models.Product)

    # rol filtresi
    if current_user.role == "user":
        query = query.filter(models.Product.owner_id == current_user.user_id)

    # arama
    if search:
        query = query.filter(models.Product.name.contains(search))

    # toplam
    total = query.count()

    # sıralama
    sort_map = {
        "id": models.Product.id,
        "name": models.Product.name,
        "quantity": models.Product.quantity,
        "created_at": models.Product.created_at,
        "updated_at": models.Product.updated_at,
    }
    col = sort_map.get(sort_by, models.Product.created_at)
    if (sort_dir or "").lower() == "asc":
        query = query.order_by(col.asc())
    else:
        query = query.order_by(col.desc())

    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return {"items": items, "total": total, "page": page, "page_size": page_size}












