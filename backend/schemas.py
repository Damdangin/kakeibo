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

#ユーザーが認証コードを入力し、「認証する」ボタンを押下して確認する場合 (任意項目)
class VerificationCheck(BaseModel):
    email: EmailStr
    verification_code: str

#全ての認証完了後、「会員登録完了」を押下する場合 (DB Userテーブル作成用)
class UserSignup(BaseModel):
    email: EmailStr
    password: str
    verification_code: str  # バックエンドで再度コードの照合を行います。

#ユーザーログイン
class UserLogin(BaseModel):
    email: EmailStr
    password: str