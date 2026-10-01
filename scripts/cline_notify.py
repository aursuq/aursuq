#!/usr/bin/env python3
import os
import sys
import smtplib
from email.message import EmailMessage
from pathlib import Path

SUBJECTS = {
    "success": "✅ Aursuq Task Completed",
    "blocked": "⚠️ Aursuq Task Needs Attention",
    "stalled": "⏳ Aursuq Task Appears Stalled",
    "cancelled": "🛑 Aursuq Task Cancelled",
    "test": "🧪 Aursuq Notification Test",
}

def load_env():
    env_path = Path.home() / ".config" / "aursuq-notify.env"
    if not env_path.exists():
        print(f"Error: Credentials file not found at {env_path}", file=sys.stderr)
        sys.exit(1)

    env = {}
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                key, val = line.split("=", 1)
                env[key.strip()] = val.strip().strip('"\'')
    return env

def send_email(status: str, message: str):
    if status not in SUBJECTS:
        print(f"Error: Unknown status '{status}'. Must be one of {list(SUBJECTS.keys())}", file=sys.stderr)
        sys.exit(1)

    env = load_env()
    smtp_user = env.get("AURSUQ_NOTIFY_SMTP_USER")
    smtp_pass = env.get("AURSUQ_NOTIFY_SMTP_PASS")
    to_addr = env.get("AURSUQ_NOTIFY_TO")

    if not smtp_user or not smtp_pass or not to_addr:
        print("Error: Missing SMTP credentials in aursuq-notify.env", file=sys.stderr)
        sys.exit(1)

    subject = SUBJECTS[status]

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = smtp_user
    msg["To"] = to_addr
    msg.set_content(message)

    try:
        # Gmail SMTP SSL on port 465
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            smtp.login(smtp_user, smtp_pass)
            refused = smtp.send_message(msg, from_addr=smtp_user, to_addrs=[to_addr])
        if refused:
            # refused is a dict {recipient: (code, message)}
            for recip, (code, msg_text) in refused.items():
                print(f"Error: Recipient refused: {recip} (code {code})", file=sys.stderr)
            sys.exit(1)
        print(f"Notification email accepted for delivery to {to_addr}")
    except Exception as e:
        print(f"Error sending email: {e}", file=sys.stderr)
        sys.exit(1)

def main():
    if len(sys.argv) < 2:
        print("Usage:", file=sys.stderr)
        print("  python3 cline_notify.py success \"message\"", file=sys.stderr)
        print("  python3 cline_notify.py success-file /path/to/summary.txt", file=sys.stderr)
        print("  python3 cline_notify.py blocked \"message\"", file=sys.stderr)
        print("  python3 cline_notify.py blocked-file /path/to/summary.txt", file=sys.stderr)
        print("  python3 cline_notify.py stalled \"message\"", file=sys.stderr)
        print("  python3 cline_notify.py cancelled \"message\"", file=sys.stderr)
        print("  python3 cline_notify.py test \"message\"", file=sys.stderr)
        sys.exit(1)

    cmd = sys.argv[1].lower()

    if cmd == "success-file":
        if len(sys.argv) < 3:
            print("Error: success-file requires a file path", file=sys.stderr)
            sys.exit(1)
        filepath = Path(sys.argv[2])
        if not filepath.exists():
            print(f"Error: File not found: {filepath}", file=sys.stderr)
            sys.exit(1)
        with open(filepath, "r", encoding="utf-8") as f:
            message = f.read().strip()
        if not message:
            print("Error: Summary file is empty", file=sys.stderr)
            sys.exit(1)
        send_email("success", message)

    elif cmd == "blocked-file":
        if len(sys.argv) < 3:
            print("Error: blocked-file requires a file path", file=sys.stderr)
            sys.exit(1)
        filepath = Path(sys.argv[2])
        if not filepath.exists():
            print(f"Error: File not found: {filepath}", file=sys.stderr)
            sys.exit(1)
        with open(filepath, "r", encoding="utf-8") as f:
            message = f.read().strip()
        if not message:
            print("Error: Blocker summary file is empty", file=sys.stderr)
            sys.exit(1)
        send_email("blocked", message)

    elif cmd == "test":
        if len(sys.argv) < 3:
            print("Usage: python3 cline_notify.py test \"message\"", file=sys.stderr)
            sys.exit(1)
        message = sys.argv[2]
        send_email("test", message)

    elif cmd in ["success", "blocked", "stalled", "cancelled"]:
        if len(sys.argv) < 3:
            print(f"Usage: python3 cline_notify.py {cmd} \"message\"", file=sys.stderr)
            sys.exit(1)
        message = sys.argv[2]
        send_email(cmd, message)

    else:
        print(f"Error: Unknown command '{cmd}'", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
