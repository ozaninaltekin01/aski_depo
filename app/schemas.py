from typing import Optional
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr = Field(..., description="User's email address")
    username: str = Field(..., min_length=3, max_length=50, description="User's username")
    password: str = Field(..., min_length=6, description="User's password")
    role: str = Field(default="user", description="User's role, default is 'user'")

class UserRequest(BaseModel):
    email : EmailStr = Field(..., description="User's email address")
    username: str = Field(..., min_length=3, max_length=50, description="User's username")
    password: str = Field(..., min_length=6, description="User's password")

class UserLogin(BaseModel):
    """Schema for user login"""
    username: str = Field(..., min_length=3, max_length=50, description="User's username")
    password: str = Field(..., min_length=6, description="User's password")

class UserResponse(BaseModel):
    """Schema for returning a user"""
    id: int
    username: str
    email: EmailStr
    created_at: datetime
    role:str


    class Config:
        from_attributes = True  # Allows Pydantic to work with SQLAlchemy models

class AdminResponse(UserResponse):
    role:str

class AdminUpdateUser(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None

    class Config:
        from_attributes = True

class ProductBase(BaseModel):

    name: str = Field(..., min_length=1, max_length=100, description="Name of the product")
    description: Optional[str] = Field(None, max_length=500, description="Description of the product")
    quantity: int = Field(..., ge=0, description="Quantity of the product in stock")

class ProductRequest(ProductBase):
    """Schema for creating a product"""
    pass

class ProductResponse(ProductBase):
    """Schema for returning a product"""
    id: int
    created_at: datetime
    updated_at:datetime
    owner_id: int
    owner : UserResponse


    class Config:
        from_attributes = True  # Allows Pydantic to work with SQLAlchemy models

class UpdatedProductRequest(ProductBase):
    updated_at: Optional[datetime] = Field(None, description="Timestamp of the last update")

class IncreaseDecreaseStock(BaseModel):
    amount: int = Field(..., ge=0, description="Amount to increase the stock by")


class Token(BaseModel):

    access_token:str
    token_type:str = "bearer"

class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[str] = None

class LogResponse(BaseModel):
    id: int
    user_id: int
    action: str
    entity: str
    entity_id: Optional[int] = None
    timestamp: datetime

    class Config:
        from_attributes = True