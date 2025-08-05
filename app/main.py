from fastapi import FastAPI
from . import models
from app.database import engine
from routers import products,auth,user



models.Base.metadata.create_all(bind=engine)

app = FastAPI()



app.include_router(products.router)
app.include_router(auth.router)
app.include_router(user.router)

@app.get("/")
async def root():
    return {"message": "Welcome to my API!"}


