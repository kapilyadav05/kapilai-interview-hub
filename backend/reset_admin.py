from getpass import getpass

from app.database import SessionLocal
from app.models import User
from app.auth.security import hash_password


def main():
    print("\n================================")
    print("      KapilAI Admin Password Reset")
    print("================================\n")

    email = "yadavkapil8319@gmail.com"

    new_password = getpass("New admin password: ")
    confirm_password = getpass("Confirm new password: ")

    if len(new_password) < 6:
        print("\nError: Password must be at least 6 characters.")
        return

    if new_password != confirm_password:
        print("\nError: Passwords do not match.")
        return

    db = SessionLocal()

    try:
        user = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

        if not user:
            print("\nError: Admin user not found.")
            return

        user.password_hash = hash_password(new_password)
        user.role = "admin"

        db.commit()
        db.refresh(user)

        print("\n================================")
        print("Admin password reset successfully!")
        print("================================")
        print(f"Name : {user.name}")
        print(f"Email: {user.email}")
        print(f"Role : {user.role}")

    except Exception as e:
        db.rollback()
        print("\nError:", e)

    finally:
        db.close()


if __name__ == "__main__":
    main()