from fastapi import APIRouter,Depends,status,HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from app.database import get_db
from sqlalchemy.orm import Session
from app import models,utils,oauth2
from app.schemas import Token

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/login", status_code=status.HTTP_200_OK, response_model=Token)
async def user_login(
        user_credentials: OAuth2PasswordRequestForm = Depends(),
        db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.username == user_credentials.username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid credentials"
        )
    if not utils.verify(user_credentials.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid credentials"
        )

    # Create token
    access_token = oauth2.create_token(data={"user_id": user.id,"role": user.role})

    return {"access_token": access_token, "token_type": "bearer"}