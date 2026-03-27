import bcrypt

# 1. 会員登録時のパスワード暗号化
def get_password_hash(password: str):
    # パ스ワードをバイト型に変換
    pwd_bytes = password.encode('utf-8')
    # ソルト(Salt)の生成
    salt = bcrypt.gensalt()
    # ハッシュ化の実行
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    # DB保存のため、再度文字列に変換して返す
    return hashed.decode('utf-8')

# 2. ログイン時のパスワード照合 (後で使用)
def verify_password(plain_password: str, hashed_password: str):
    # 照合時も、入力されたプレーンテキストをバイト型に変換してチェック
    return bcrypt.checkpw(
        plain_password.encode('utf-8'), 
        hashed_password.encode('utf-8')
    )