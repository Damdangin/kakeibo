from sqlalchemy import Column, Integer, String, Date, Boolean, DateTime, func
from database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)  # 項目名
    amount = Column(Integer)  # 金額
    date = Column(Date)  # 日付

class EmailVerification(Base):
    __tablename__ = "email_verifications"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True, nullable=False)
    verification_code = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_verified = Column(Boolean, default=False) # 인증 성공 여부

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False) 
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True) # 가입 완료 시 True
    created_at = Column(DateTime(timezone=True), server_default=func.now())