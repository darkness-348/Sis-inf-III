import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def create_db_if_not_exists():
    try:
        conn = psycopg2.connect(
            dbname='postgres',
            user='postgres',
            password='12622528',
            host='localhost',
            port=5432
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        cur.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'siniestros_db'")
        exists = cur.fetchone()
        if not exists:
            cur.execute("CREATE DATABASE siniestros_db")
            print("Database 'siniestros_db' created successfully.")
        else:
            print("Database 'siniestros_db' already exists.")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error checking/creating database: {e}")

if __name__ == "__main__":
    create_db_if_not_exists()
