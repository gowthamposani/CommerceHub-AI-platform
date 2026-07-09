from fastapi import FastAPI

app = FastAPI(
    title="CommerceHub AI",
    version="1.0.0"
)

@app.get("/health")
def health():
    return {"status": "healthy"}