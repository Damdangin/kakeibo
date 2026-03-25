from sqlalchemy import Column, Integer, String, Date, Boolean, DateTime, func
from database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)  # 項目名
    amount = Column(Integer)  # 金額
    date = Column(Date)  # 日付

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False) 
    hashed_password = Column(String, nullable=False)
    
    # Email
    is_active = Column(Boolean, default=False)
    verification_code = Column(String, nullable=True)
    code_created_at = Column(DateTime(timezone=True), server_default=func.now())