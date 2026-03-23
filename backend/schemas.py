from pydantic import BaseModel
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