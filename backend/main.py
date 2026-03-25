from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import smtplib
import random
from email.message import EmailMessage
import models, schemas, database
from auth_utils import get_password_hash, verify_password

# from auth_utils import get_password_hash
models.Base.metadata.create_all(bind=database.engine)

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587  # Gmail은 587(TLS)을 사용합니다.
SENDER_EMAIL = "ttodggs@gmail.com"  # 본인의 Gmail 주소
SENDER_PASSWORD = "dsuf vgul zfnx imfz" # 방금 발급받은 16자리 앱 비밀번호

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

# 1. 認証番号送信 (Send Email)
@app.post("/auth/send-email")
async def send_email(request: schemas.EmailRequest, db: Session = Depends(get_db)):
    # 중복 체크 로직 생략 (기존 코드 유지)

    code = str(random.randint(100000, 999999))
    
    # 메일 객체 생성
    msg = EmailMessage()
    msg["Subject"] = "[Kakeibo] 認証番号のご案内"
    msg["From"] = SENDER_EMAIL
    msg["To"] = request.email
    msg.set_content(f"認証番号は 【{code}】 です。")

    try:
        # Gmail은 TLS 보안 연결을 사용합니다.
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()  # TLS 시작 (보안 연결)
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.send_message(msg)
        
        # DB 저장 로직 (기존 코드 그대로 유지)
        temp_user = db.query(models.User).filter(models.User.email == request.email).first()
        if temp_user:
            temp_user.verification_code = code
        else:
            temp_user = models.User(email=request.email, verification_code=code, hashed_password="temp")
            db.add(temp_user)
        
        db.commit()
        return {"message": "認証番号を送信しました。"}
    except Exception as e:
        print(f"Mail Error: {e}") 
        raise HTTPException(status_code=500, detail=f"メール送信に失敗しました: {str(e)}")
    

# 2. 新規会員登録 (Signup)
@app.post("/signup")
def signup(user_data: schemas.UserSignup, db: Session = Depends(get_db)):
    # ユーザーと認証番号の確認
    user = db.query(models.User).filter(
        models.User.email == user_data.email, 
        models.User.verification_code == user_data.verification_code
    ).first()

    if not user:
        raise HTTPException(status_code=400, detail="認証番号が一致しないか、無効です。")

    # 正式に登録処理
    user.hashed_password = get_password_hash(user_data.password)
    user.is_active = True
    user.verification_code = None # 使用済みコードを削除
    db.commit()
    
    return {"message": "ユーザー登録が完了しました！"}