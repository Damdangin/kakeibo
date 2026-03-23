from sqlalchemy import Column, Integer, String, Date
from database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)  # 項目名
    amount = Column(Integer)  # 金額
    date = Column(Date)  # 日付