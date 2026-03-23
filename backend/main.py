from fastapi import FastAPI
app = FastAPI()

@app.get("/")
def 例():
    return "hello"