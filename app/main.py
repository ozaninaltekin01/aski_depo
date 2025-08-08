from fastapi import FastAPI
from . import models
from app.database import engine
from routers import products,auth,user,logs
from fastapi.middleware.cors import CORSMiddleware





models.Base.metadata.create_all(bind=engine)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # GÜVENLİK: "*" yerine frontend URL'ini yaz! Örn: ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




app.include_router(products.router)
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(logs.router)

@app.get("/")
async def root():
    return {"message": "Welcome to my API!"}


