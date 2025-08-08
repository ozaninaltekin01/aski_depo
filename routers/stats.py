# app/routers/stats.py
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from datetime import datetime, timedelta
from typing import List, Optional

from app.database import get_db
from app import models, schemas
from app.oauth2 import get_current_user

router = APIRouter(prefix="/stats", tags=["stats"])

@router.get("/", response_model=schemas.StatsResponse, status_code=status.HTTP_200_OK)
async def get_stats(
    db: Session = Depends(get_db),
    threshold: int = 10,
    current_user: schemas.TokenData = Depends(get_current_user),
):
    # total
    total_all = db.query(func.count(models.Product.id)).scalar() or 0
    total_mine = db.query(func.count(models.Product.id)).filter(models.Product.owner_id == current_user.user_id).scalar() or 0

    # low stock
    low_all = db.query(func.count(models.Product.id)).filter(models.Product.quantity < threshold).scalar() or 0
    low_mine = db.query(func.count(models.Product.id)).filter(
        models.Product.owner_id == current_user.user_id,
        models.Product.quantity < threshold
    ).scalar() or 0

    # today
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    added_today_all = db.query(func.count(models.Product.id)).filter(models.Product.created_at >= today_start).scalar() or 0
    added_today_mine = db.query(func.count(models.Product.id)).filter(
        models.Product.owner_id == current_user.user_id,
        models.Product.created_at >= today_start
    ).scalar() or 0

    return {
        "totals": {"all": total_all, "mine": total_mine},
        "low_stock": {"all": low_all, "mine": low_mine, "threshold": threshold},
        "added_today": {"all": added_today_all, "mine": added_today_mine},
    }

@router.get("/daily", response_model=List[schemas.DailyStat], status_code=status.HTTP_200_OK)
async def daily_added_stats(
    days: int = 7,
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(get_current_user),
):
    if days < 1 or days > 30:
        days = 7

    out = []
    # Son N gün (en eski -> en yeni)
    for i in range(days - 1, -1, -1):
        day_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=i)
        day_end = day_start + timedelta(days=1)

        count_all = db.query(func.count(models.Product.id)).filter(
            models.Product.created_at >= day_start,
            models.Product.created_at < day_end
        ).scalar() or 0

        count_mine = db.query(func.count(models.Product.id)).filter(
            models.Product.owner_id == current_user.user_id,
            models.Product.created_at >= day_start,
            models.Product.created_at < day_end
        ).scalar() or 0

        out.append({
            "date": day_start.date().isoformat(),
            "count_all": count_all,
            "count_mine": count_mine
        })

    return out
