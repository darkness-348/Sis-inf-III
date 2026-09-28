from datetime import date, datetime
from app.infrastructure.database import SessionLocal, Base, engine
from app.infrastructure.models import (
    PolicyModel, AdjusterModel, ClaimModel, 
    DamageAssessmentModel, FraudAnalysisModel, PaymentAuthorizationModel, UserModel
)
from app.domain.enums import PolicyStatus, ClaimStatus, FraudRiskLevel, ApprovalLevel, PolicyType, UserRole
from app.infrastructure.security import hash_password
import json

def seed_database():
    engine.dispose()
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        print("Seeding initial users...")
        u1 = UserModel(
            username="carlos_analyst",
            email="carlos.analyst@segurosalfa.com",
            hashed_password=hash_password("password123"),
            full_name="Lic. Carlos Analyst",
            role=UserRole.ANALYST,
            is_active=True
        )
        u2 = UserModel(
            username="admin_upds",
            email="admin@upds.edu.bo",
            hashed_password=hash_password("admin123"),
            full_name="Ing. Director de Sistemas",
            role=UserRole.ADMIN,
            is_active=True
        )
        u3 = UserModel(
            username="juan_cliente",
            email="juan.perez@email.com",
            hashed_password=hash_password("password123"),
            full_name="Juan Pérez Rodríguez (Cliente)",
            role=UserRole.CLIENT,
            is_active=True
        )
        db.add_all([u1, u2, u3])
        db.commit()

        print("Seeding policies...")
        p1 = PolicyModel(
            policy_number="POL-2026-8801",
            insured_name="Juan Pérez Rodríguez",
            insured_document="1723456789",
            policy_type=PolicyType.AUTO,
            coverage_amount=35000.0,
            start_date=date(2026, 1, 15),
            end_date=date(2027, 1, 15),
            status=PolicyStatus.ACTIVE
        )
        p2 = PolicyModel(
            policy_number="POL-2026-8802",
            insured_name="María Fernanda Gómez",
            insured_document="0918273645",
            policy_type=PolicyType.HOME,
            coverage_amount=150000.0,
            start_date=date(2026, 3, 1),
            end_date=date(2027, 3, 1),
            status=PolicyStatus.ACTIVE
        )
        p3 = PolicyModel(
            policy_number="POL-2026-8803",
            insured_name="Corporación Logistics S.A.",
            insured_document="1790012345001",
            policy_type=PolicyType.COMMERCIAL,
            coverage_amount=500000.0,
            start_date=date(2026, 2, 10),
            end_date=date(2027, 2, 10),
            status=PolicyStatus.ACTIVE
        )
        p4 = PolicyModel(
            policy_number="POL-2025-4100",
            insured_name="Carlos Ruiz Alvarado",
            insured_document="1102938475",
            policy_type=PolicyType.AUTO,
            coverage_amount=20000.0,
            start_date=date(2025, 1, 1),
            end_date=date(2025, 12, 31),
            status=PolicyStatus.EXPIRED
        )

        db.add_all([p1, p2, p3, p4])
        db.commit()

        print("Seeding adjusters...")
        a1 = AdjusterModel(
            full_name="Ing. Roberto Mendoza",
            specialty="Peritaje Automotriz",
            phone="+593 99 123 4567",
            email="roberto.mendoza@peritos.com",
            is_active=True
        )
        a2 = AdjusterModel(
            full_name="Arq. Sofía Valenzuela",
            specialty="Daños Inmobiliarios y Estructuras",
            phone="+593 98 765 4321",
            email="sofia.valenzuela@peritos.com",
            is_active=True
        )
        a3 = AdjusterModel(
            full_name="Lic. Fernando Torres",
            specialty="Maquinaria Pesada y Comercial",
            phone="+593 99 555 8899",
            email="fernando.torres@peritos.com",
            is_active=True
        )

        db.add_all([a1, a2, a3])
        db.commit()

        print("Seeding initial claims...")
        # Claim 1: Liquidated
        c1 = ClaimModel(
            claim_number="SIN-2026-0001",
            policy_id=p1.id,
            policy_number=p1.policy_number,
            incident_date=date(2026, 5, 12),
            incident_description="Colisión leve en parqueadero. Abolladura de parachoques delantero y faros rotos.",
            incident_location="Av. República del Salvador 450",
            claimed_amount=2400.0,
            status=ClaimStatus.LIQUIDATED,
            created_at=datetime(2026, 5, 13, 10, 30),
            adjuster_id=a1.id,
            fraud_risk_level=FraudRiskLevel.LOW,
            authorized_payment_amount=2200.0
        )
        db.add(c1)
        db.commit()

        d1 = DamageAssessmentModel(
            claim_id=c1.id,
            adjuster_id=a1.id,
            assessment_date=datetime(2026, 5, 14, 14, 0),
            description="Reemplazo de parachoques y faro delantero derecho. Pintura de guardafango.",
            estimated_cost=2200.0,
            labor_cost=600.0,
            parts_cost=1600.0,
            approved_by_adjuster=True
        )
        f1 = FraudAnalysisModel(
            claim_id=c1.id,
            total_score=0,
            risk_level=FraudRiskLevel.LOW,
            triggered_rules=json.dumps([]),
            analysis_notes="Sin banderas de riesgo detectadas. Flujo normal.",
            analyzed_at=datetime(2026, 5, 13, 10, 35)
        )
        pay1 = PaymentAuthorizationModel(
            claim_id=c1.id,
            authorized_amount=2200.0,
            required_level=ApprovalLevel.JUNIOR_ANALYST,
            authorized_by="Lic. Carlos Analyst",
            status="PAID",
            authorization_date=datetime(2026, 5, 15, 11, 0),
            notes="Pago acreditado exitosamente a la cuenta bancaria del asegurado."
        )
        db.add_all([d1, f1, pay1])

        # Claim 2: High Fraud Risk Flagged
        c2 = ClaimModel(
            claim_number="SIN-2026-0002",
            policy_id=p1.id,
            policy_number=p1.policy_number,
            incident_date=date(2026, 1, 25),
            incident_description="Pérdida total del vehículo por incendio repentino en vía secundaria sin testigos durante la madrugada.",
            incident_location="Carretera Antigua Km 42",
            claimed_amount=32000.0,
            status=ClaimStatus.FRAUD_FLAGGED,
            created_at=datetime(2026, 1, 26, 8, 15),
            adjuster_id=a1.id,
            fraud_risk_level=FraudRiskLevel.CRITICAL
        )
        db.add(c2)
        db.commit()

        f2 = FraudAnalysisModel(
            claim_id=c2.id,
            total_score=85,
            risk_level=FraudRiskLevel.CRITICAL,
            triggered_rules=json.dumps([
                "Siniestro temprano (< 30 días inicio póliza)",
                "Monto reclamado elevado (>= 75% cobertura)",
                "Circunstancias atípicas (Fin de semana / Sin testigos)",
                "Valor cuantioso del siniestro (>= $30,000 USD)"
            ]),
            analysis_notes="Alerta Crítica: Múltiples factores de riesgo severo detectados.",
            analyzed_at=datetime(2026, 1, 26, 8, 20)
        )
        db.add(f2)

        # Claim 3: Assigned to adjuster
        c3 = ClaimModel(
            claim_number="SIN-2026-0003",
            policy_id=p2.id,
            policy_number=p2.policy_number,
            incident_date=date(2026, 6, 18),
            incident_description="Rotura de tubería principal afectando pisos de parquet y muebles de cocina.",
            incident_location="Urb. El Bosque Calle B-12",
            claimed_amount=8500.0,
            status=ClaimStatus.ASSIGNED_TO_ADJUSTER,
            created_at=datetime(2026, 6, 19, 15, 45),
            adjuster_id=a2.id,
            fraud_risk_level=FraudRiskLevel.LOW
        )
        db.add(c3)
        db.commit()

        f3 = FraudAnalysisModel(
            claim_id=c3.id,
            total_score=10,
            risk_level=FraudRiskLevel.LOW,
            triggered_rules=json.dumps([]),
            analysis_notes="Verificación automática superada.",
            analyzed_at=datetime(2026, 6, 19, 15, 50)
        )
        db.add(f3)

        # Claim 4: Pending Approval
        c4 = ClaimModel(
            claim_number="SIN-2026-0004",
            policy_id=p3.id,
            policy_number=p3.policy_number,
            incident_date=date(2026, 7, 5),
            incident_description="Inundación en bodega comercial de carga por lluvias intensas.",
            incident_location="Zona Industrial Lote 88",
            claimed_amount=48000.0,
            status=ClaimStatus.PENDING_APPROVAL,
            created_at=datetime(2026, 7, 6, 9, 0),
            adjuster_id=a3.id,
            fraud_risk_level=FraudRiskLevel.MEDIUM
        )
        db.add(c4)
        db.commit()

        d4 = DamageAssessmentModel(
            claim_id=c4.id,
            adjuster_id=a3.id,
            assessment_date=datetime(2026, 7, 8, 16, 30),
            description="Inspección detallada de pallets anegados. Pérdida parcial de electrodomésticos.",
            estimated_cost=42500.0,
            labor_cost=4500.0,
            parts_cost=38000.0,
            approved_by_adjuster=True
        )
        f4 = FraudAnalysisModel(
            claim_id=c4.id,
            total_score=35,
            risk_level=FraudRiskLevel.MEDIUM,
            triggered_rules=json.dumps(["Valor cuantioso del siniestro (>= $30,000 USD)"]),
            analysis_notes="Riesgo Medio debido al alto monto. Reporte climático verificado.",
            analyzed_at=datetime(2026, 7, 6, 9, 5)
        )
        db.add_all([d4, f4])

        db.commit()
        print("Database seeded with users and claims successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
