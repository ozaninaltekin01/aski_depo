from fastapi import APIRouter, HTTPException, Depends, status
from app.database import get_db
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


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schemas.UserResponse)
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


