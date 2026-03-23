from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import models, schemas, database
# from auth_utils import get_password_hash

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# --- CORS設定 ---
origins = [
    "http://localhost:3000", # Next.jsの開発サーバーを許可
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # 全てのメソッド（GET, POSTなど）を許可
    allow_headers=["*"], # 全てのヘッダーを許可
)

# --- APIエンドポイント ---
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 取得 (Read)
@app.get("/transactions", response_model=List[schemas.Transaction])
def read_transactions(db: Session = Depends(get_db)):
    return db.query(models.Transaction).all()

# 保存 (Create)
@app.post("/transactions", response_model=schemas.Transaction)
def create_transaction(item: schemas.TransactionCreate, db: Session = Depends(get_db)):
    db_item = models.Transaction(**item.model_dump()) # Pydanticを辞書にして展開
    db.add(db_item)
    db.commit()
    db.refresh(db_item) # IDなどが付与された最新状態を反映
    return db_item

# ユーザー登録用
@app.post("/signup")
def signup(username: str, password: str, db: Session = Depends(get_db)):
    # すでに同じ名前のユーザーがいないかチェック
    existing_user = db.query(models.User).filter(models.User.username == username).first()
    if existing_user:
        return {"error": "このユーザー名は既に使われています"}
    
    hashed_pwd = get_password_hash(password)
    new_user = models.User(username=username, hashed_password=hashed_pwd)
    db.add(new_user)
    db.commit()
    return {"message": "ユーザー登録が完了しました！"}