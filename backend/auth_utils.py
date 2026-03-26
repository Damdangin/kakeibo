# from passlib.context import CryptContext

# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# def get_password_hash(password: str):
#     plain_password = str(password).strip()
#     return pwd_context.hash(plain_password)

# def verify_password(plain_password, hashed_password):
#     return pwd_context.verify(plain_password, hashed_password)

import bcrypt

# 1. 회원가입 시 비밀번호 암호화
def get_password_hash(password: str):
    # 비밀번호를 바이트(bytes)로 변환
    pwd_bytes = password.encode('utf-8')
    # 솔트(Salt) 생성
    salt = bcrypt.gensalt()
    # 해싱 실행
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    # DB 저장을 위해 다시 문자열(string)로 변환해서 반환
    return hashed.decode('utf-8')

# 2. 로그인 시 비밀번호 비교 (나중에 사용)
def verify_password(plain_password: str, hashed_password: str):
    # 비교할 때도 입력받은 평문을 바이트로 변환하여 체크
    return bcrypt.checkpw(
        plain_password.encode('utf-8'), 
        hashed_password.encode('utf-8')
    )