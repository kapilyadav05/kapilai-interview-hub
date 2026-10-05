from getpass import getpass

from app.database import SessionLocal
from app.models import User
from app.auth.security import hash_password


def main():
    print("\n================================")
    print("      KapilAI Admin Creator")
    print("================================\n")

    name = input("Admin name: ").strip()
    email = input("Admin email: ").strip().lower()
    password = getpass("Admin password: ")
    confirm_password = getpass("Confirm password: ")

    if not name:
        print("Error: Admin name is required.")
        return

    if not email:
        print("Error: Admin email is required.")
        return

    if len(password) < 6:
        print("Error: Password must be at least 6 characters.")
        return

    if password != confirm_password:
        print("Error: Passwords do not match.")
        return

    db = SessionLocal()

    try:
        existing_user = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

        if existing_user:
            if existing_user.role == "admin":
                print("This user is already an admin.")
                return

            existing_user.role = "admin"
            db.commit()

            print("\nExisting user promoted to Admin successfully.")
            return

        admin = User(
            name=name,
            email=email,
            password_hash=hash_password(password),
            role="admin"
        )

        db.add(admin)
        db.commit()
        db.refresh(admin)

        print("\n================================")
        print("Admin created successfully!")
        print("================================")
        print(f"Name : {admin.name}")
        print(f"Email: {admin.email}")
        print("Role : admin")

    finally:
        db.close()


if __name__ == "__main__":
    main()