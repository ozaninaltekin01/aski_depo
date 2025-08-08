from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas, oauth2

router = APIRouter(
    prefix="/logs",
    tags=["Logs"]
)

@router.get("/", response_model=List[schemas.LogResponse])
def get_logs(
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(oauth2.get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return db.query(models.Log).order_by(models.Log.timestamp.desc()).all()


