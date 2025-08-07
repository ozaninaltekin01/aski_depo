from fastapi import APIRouter, HTTPException, Depends, status
from app.database import get_db
from sqlalchemy.orm import  Session
from app import models,schemas,utils,oauth2
from typing import List, Optional


router = APIRouter(
    prefix="/users",
    tags=["users"]
)


@router.get("/me", response_model=schemas.UserResponse, status_code=status.HTTP_200_OK)
async def get_current_user_info(db=Depends(get_db),
                                current_user: schemas.TokenData = Depends(oauth2.get_current_user)):
    user = db.query(models.User).filter(models.User.id == current_user.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.get("/admin", response_model=List[schemas.AdminResponse], status_code=status.HTTP_200_OK)
async def get_all_users(db=Depends(get_db),
                        current_user: schemas.TokenData = Depends(oauth2.get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view all users"
        )
    users = db.query(models.User).all()
    return users


@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=schemas.UserResponse)
async def user_create(user: schemas.UserRequest,db = Depends(get_db)):

    user.password = utils.hash(user.password)
    try:
        new_user = models.User(**user.model_dump(exclude_unset=True))
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
    except Exception as e:
        db.rollback()
        if 'UNIQUE constraint failed: users.username' in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists"
            )
        elif 'UNIQUE constraint failed: users.email' in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists"
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Database error occurred"
        )

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(oauth2.get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    db.delete(user)
    db.commit()
    return



@router.put("/{user_id}", response_model=schemas.AdminResponse)
async def update_user(
    user_id: int,
    user_update: schemas.AdminUpdateUser,
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(oauth2.get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    # Sadece gelen alanları güncelle
    update_data = user_update.model_dump(exclude_unset=True)
    # Parola güncelleme yoksa, eski hash kalır; rolün değişimi/permisyonu kontrol et
    if "password" in update_data:
        update_data["password"] = utils.hash(update_data["password"])
    for key, val in update_data.items():
        setattr(user, key, val)
    db.commit()
    db.refresh(user)
    return user
