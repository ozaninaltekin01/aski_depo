from jose import jwt, JWTError
from datetime import datetime,timedelta
from app import schemas
from fastapi import Depends,HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")



SECRET_KEY = settings.secret_key
ALGORITHM = settings.algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes

def create_token(data: dict):
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt

def verify_token(token:str ,credentials_exception):
  try:

    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    user_id:str = payload.get("user_id")
    role:str = payload.get("role")

    if user_id is None:
        raise credentials_exception
    token_data = schemas.TokenData(user_id=user_id,role =role)
    return token_data
  except JWTError:
      raise credentials_exception

def get_current_user(token:str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"}
    )
    return verify_token(token, credentials_exception)