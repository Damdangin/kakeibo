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

#SMTP設定
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587  # Gmailは 587(TLS)
SENDER_EMAIL = "ttodggs@gmail.com"
SENDER_PASSWORD = "dsuf vgul zfnx imfz"

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
@app.post("/send-email")
async def send_email(request: schemas.EmailRequest, db: Session = Depends(get_db)):

    code = str(random.randint(100000, 999999))
    
    msg = EmailMessage()
    msg["Subject"] = "[Kakeibo] 認証番号のご案内"
    msg["From"] = SENDER_EMAIL
    msg["To"] = request.email
    msg.set_content(f"認証番号は 【{code}】 です。")

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()  # TLS開始 (セキュア接続)
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.send_message(msg)
        
        db_verification = db.query(models.EmailVerification).filter(
            models.EmailVerification.email == request.email
        ).first()

        if db_verification:
            # 既存レコードがある場合は認証コードのみ更新
            db_verification.verification_code = code
            # 必要に応じて生成時間も更新
            # db_verification.created_at = func.now() 
        else:
            # レコードがない場合は新規作成
            db_verification = models.EmailVerification(
                email=request.email, 
                verification_code=code
            )
            db.add(db_verification)
        
        db.commit()
        return {"message": "認証番号を送信しました。"}
    
    except Exception as e:
        db.rollback()
        print(f"Mail Error: {e}") 
        raise HTTPException(status_code=500, detail=f"メール送信に失敗しました: {str(e)}")
    
@app.post("/verify-code")
async def verify_code(request: schemas.VerificationCheck, db: Session = Depends(get_db)):
    # DBから該当メールアドレスの最新認証情報を取得
    db_verification = db.query(models.EmailVerification).filter(
        models.EmailVerification.email == request.email
    ).order_by(models.EmailVerification.created_at.desc()).first()

    # 認証情報が存在しない場合
    if not db_verification:
        raise HTTPException(status_code=404, detail="認証要求の記録が見つかりません。")

    # 認証コードの照合
    if db_verification.verification_code != request.verification_code:
        # 不一致の場合、認証ステータスをFalseで固定 (セキュリティ対策)
        db_verification.is_verified = False
        db.commit()
        raise HTTPException(status_code=400, detail="認証番号が一致しません。")

    # 照合成功時、認証済みステータス(True)に変更
    db_verification.is_verified = True
    db.commit()
    
    return {"message": "認証に成功しました。"}

# 2. 新規会員登録 (Signup)
@app.post("/signup")
def signup(user_data: schemas.UserSignup, db: Session = Depends(get_db)):
    # 1. EmailVerificationテーブルで認証ステータスを確認
    verification = db.query(models.EmailVerification).filter(
        models.EmailVerification.email == user_data.email,
        models.EmailVerification.verification_code == user_data.verification_code,
        models.EmailVerification.is_verified == True  # 認証済み必須
    ).first()

    # 認証記録がない、コード不一致、または認証ボタン未押下の場合
    if not verification:
        raise HTTPException(
            status_code=400, 
            detail="認証が完了していないか、認証番号が一致しません。"
        )

    # 2. Userテーブルに新規レコード作成 (INSERT)
    # 重複登録チェック
    existing_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="既に登録されているメールアドレスです。")
    
    new_user = models.User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password), # パスワード暗号化
        is_active=True
    )
    
    db.add(new_user)
    
    # 3. 登録完了後、不要な一時認証データを削除
    db.delete(verification)
    
    db.commit()
    return {"message": "ユーザー登録が完了しました！"}

#login/page.tsx
@app.post("/login")
def login(user_data: schemas.UserLogin, db: Session = Depends(get_db)):
    #DBからユーザーを取得
    user = db.query(models.User).filter(models.User.email == user_data.email).first()
    
    # 2. ユーザーが存在しない、またはパスワードが不一致の場合
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=401, 
            detail="メールアドレスまたはパスワードが正しくありません。"
        )

    # 3. 本来はここでJWTトークンを生成して返しますが、まずは成功メッセージを返します
    return {"message": "ログイン成功", "email": user.email}