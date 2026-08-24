import enum


class UserRole(str, enum.Enum):
    officer = "officer"
    prosecutor = "prosecutor"
    forensic_expert = "forensic_expert"
    judge = "judge"
    admin = "admin"


class DocType(str, enum.Enum):
    fir = "fir"
    chargesheet = "chargesheet"
    forensic_report = "forensic_report"
    witness_statement = "witness_statement"
    court_filing = "court_filing"
    evidence = "evidence"
