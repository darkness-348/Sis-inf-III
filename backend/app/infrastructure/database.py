from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
import logging

logger = logging.getLogger("siniestros_db")

# PostgreSQL credentials requested by user
POSTGRES_USER = os.getenv("POSTGRES_USER", "postgres")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "12622528")
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
POSTGRES_DB = os.getenv("POSTGRES_DB", "siniestros_db")

POSTGRES_URL = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
SQLITE_URL = "sqlite:///./siniestros.db"

# Try connecting to PostgreSQL, fallback to SQLite if PostgreSQL service is unavailable
DATABASE_URL = os.getenv("DATABASE_URL", POSTGRES_URL)

try:
    if "postgresql" in DATABASE_URL:
        # Test engine creation for PostgreSQL
        engine = create_engine(DATABASE_URL, pool_pre_ping=True)
        # Test connection
        with engine.connect() as conn:
            pass
        logger.info(f"Conectado exitosamente a la base de datos PostgreSQL en {POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}")
    else:
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
        logger.info(f"Conectado a la base de datos SQLite: {DATABASE_URL}")
except Exception as e:
    logger.warning(f"No se pudo conectar a PostgreSQL ({e}). Conectando a SQLite por defecto.")
    DATABASE_URL = SQLITE_URL
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
