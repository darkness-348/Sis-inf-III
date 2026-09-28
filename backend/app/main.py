from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import time
import logging

from app.infrastructure.database import Base, engine
from app.presentation.controllers import policy_controller, adjuster_controller, claim_controller, auth_controller
from app.domain.exceptions import DomainException

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("siniestros_api")

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Sistema de Gestión y Liquidación de Siniestros API (UPDS)",
    description="Backend desarrollado en Python con FastAPI y Arquitectura Limpia (Domain, Application, Infrastructure, Presentation) protegido con JWT Bearer Token Security.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

@app.on_event("startup")
def startup_db_seed():
    from app.infrastructure.database import SessionLocal, Base, engine
    from app.infrastructure.models import UserModel
    from app.seed import seed_database
    
    need_seed = False
    db = SessionLocal()
    try:
        if db.query(UserModel).count() == 0:
            need_seed = True
    except Exception as e:
        logger.error(f"Error checking database: {e}")
        need_seed = True
    finally:
        db.close()
        engine.dispose()
        
    if need_seed:
        logger.info("Empty database detected. Seeding initial data...")
        try:
            seed_database()
        except Exception as e:
            logger.error(f"Error seeding database: {e}")


# CORS Middleware setup
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_origin_regex=r"https?://.*",
)

# Request Timing & Audit Middleware
@app.middleware("http")
async def audit_logging_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    logger.info(f"{request.method} {request.url.path} -> {response.status_code} ({process_time:.2f}ms)")
    response.headers["X-Process-Time-Ms"] = f"{process_time:.2f}"
    return response

# Global Domain Exception Handler (Clean Architecture Exception Mapping)
@app.exception_handler(DomainException)
async def domain_exception_handler(request: Request, exc: DomainException):
    logger.warning(f"Domain Exception: {exc}")
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error_type": exc.__class__.__name__,
            "detail": str(exc),
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")
        }
    )

# Register Routers (Auth Controller contains public /api/auth/register and /api/auth/login)
app.include_router(auth_controller.router)
app.include_router(policy_controller.router)
app.include_router(adjuster_controller.router)
app.include_router(claim_controller.router)

@app.get("/", tags=["Health Check"])
def root():
    return {
        "status": "online",
        "system": "Sistema de Gestión y Liquidadora de Siniestros (Clean Architecture + FastAPI)",
        "security": "JWT Bearer Token Protected",
        "docs": "/docs"
    }
