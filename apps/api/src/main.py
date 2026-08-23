from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.database import engine, Base
from src.auth.router import router as auth_router

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TrialBridge AI API",
    description="Backend API for TrialBridge AI",
    version="1.0.0"
)

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1")

@app.get("/api/v1/health")
async def health_check():
    return {"status": "healthy"}
