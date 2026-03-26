from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional

# 共通の属性
class TransactionBase(BaseModel):
    name: str
    amount: int
    date: date

# データを登録する時に使う（IDは自動採番なので不要）
class TransactionCreate(TransactionBase):
    pass

# データを読み出す時に使う（IDが含まれる）
class Transaction(TransactionBase):
    id: int
    class Config:
        from_attributes = True # SQLAlchemyのモデルをPydanticに変換可能にする設定

# --- Auth Schemas ---
class EmailRequest(BaseModel):
    email: EmailStr

# 2. 사용자가 번호를 입력하고 '인증하기' 버튼을 눌러 확인할 때 (선택 사항)
class VerificationCheck(BaseModel):
    email: EmailStr
    verification_code: str

# 3. 모든 인증이 끝나고 '회원가입 완료'를 누를 때 (실제 DB User 테이블 생성용)
class UserSignup(BaseModel):
    email: EmailStr
    password: str
    verification_code: str  # 백엔드에서 마지막으로 번호를 한 번 더 대조합니다.