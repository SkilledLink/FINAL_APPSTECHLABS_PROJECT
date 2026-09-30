import psycopg

# Replace the placeholder with your actual password
DATABASE_URL = "postgresql://skilledlink_user:UVhLu7qpkIGjAtLghheHbfqSPrtmDJUY@dpg-dauji8rncjis73fslstg-a.oregon-postgres.render.com/skilledlink"

try:
    with psycopg.connect(DATABASE_URL) as conn:
        with conn.cursor() as cur:
            cur.execute("ALTER TABLE users DROP COLUMN IF EXISTS username;")
            conn.commit()
            print("Column 'username' dropped successfully.")
except Exception as e:
    print(f"An error occurred: {e}")