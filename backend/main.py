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
            server.starttls()  # TLS 시작 (보안 연결)
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.send_message(msg)
        
        db_verification = db.query(models.EmailVerification).filter(
            models.EmailVerification.email == request.email
        ).first()

        if db_verification:
            # 이미 있으면 번호만 업데이트
            db_verification.verification_code = code
            # 필요하다면 생성 시간도 업데이트
            # db_verification.created_at = func.now() 
        else:
            # 없으면 새로 생성
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
    # DB에서 해당 이메일의 최신 인증 정보 조회
    db_verification = db.query(models.EmailVerification).filter(
        models.EmailVerification.email == request.email
    ).order_by(models.EmailVerification.created_at.desc()).first()

    # 인증 정보가 아예 없는 경우
    if not db_verification:
        raise HTTPException(status_code=404, detail="認証要求の記録が見つかりません。")

    # 번호 대조
    if db_verification.verification_code != request.verification_code:
        # 틀리면 인증 상태를 False로 확실히 고정 (보안)
        db_verification.is_verified = False
        db.commit()
        raise HTTPException(status_code=400, detail="認証番号が一致しません。")

    # 번호가 맞으면 승인 상태(True)로 변경
    db_verification.is_verified = True
    db.commit()
    
    return {"message": "認証に成功しました。"}

# 2. 新規会員登録 (Signup)
@app.post("/signup")
def signup(user_data: schemas.UserSignup, db: Session = Depends(get_db)):
    # 1. [수정] User 테이블이 아닌 EmailVerification 테이블에서 인증 상태 확인
    verification = db.query(models.EmailVerification).filter(
        models.EmailVerification.email == user_data.email,
        models.EmailVerification.verification_code == user_data.verification_code,
        models.EmailVerification.is_verified == True  # 반드시 True여야 함
    ).first()

    # 인증 기록이 없거나, 번호가 틀렸거나, '인증하기' 버튼을 안 눌렀을 경우
    if not verification:
        raise HTTPException(
            status_code=400, 
            detail="認証が完了していないか, 認証番号が一致しません。"
        )

    # 2. [수정] 실제 User 테이블에 새로운 레코드 생성 (INSERT)
    # 기존에 이미 가입된 이메일인지 체크 (중복 방지)
    existing_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="既に登録されているメールアドレスです。")
    
    hashed_pw = get_password_hash(user_data.password)

    new_user = models.User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password), # 비밀번호 암호화
        is_active=True
    )
    
    db.add(new_user)
    
    # 3. [추가] 가입이 완료되었으므로 임시 인증 데이터는 삭제 (깔끔하게 정리)
    db.delete(verification)
    
    db.commit()
    return {"message": "ユーザー登録が完了しました！"}