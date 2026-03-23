from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 接続先URL (ユーザー名:パスワード@ホスト:ポート/DB名)
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:1234@localhost:5432/kakeibo_db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()