import { PrismaClient, RiskLevel, UserRole, EntryStatus, EntryState, IncidentSeverity, ShiftStatus, GrievanceStatus, MaintenanceStatus, CertificationType, AuditAction } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 12);

  // ── Admin User ──
  const admin = await prisma.user.create({
    data: { email: 'admin@manholeguard.in', passwordHash, role: 'ADMIN', language: 'en' },
  });

  // ── 3 Supervisors ──
  const supervisorUsers = await Promise.all([
    prisma.user.create({ data: { email: 'supervisor1@manholeguard.in', passwordHash, role: 'SUPERVISOR' } }),
    prisma.user.create({ data: { email: 'supervisor2@manholeguard.in', passwordHash, role: 'SUPERVISOR' } }),
    prisma.user.create({ data: { email: 'supervisor3@manholeguard.in', passwordHash, role: 'SUPERVISOR' } }),
  ]);

  const supervisors = await Promise.all([
    prisma.supervisor.create({ data: { userId: supervisorUsers[0].id, name: 'Rajesh Kumar', phone: '9876543210', area: 'Andheri' } }),
    prisma.supervisor.create({ data: { userId: supervisorUsers[1].id, name: 'Suresh Patil', phone: '9876543211', area: 'Bandra' } }),
    prisma.supervisor.create({ data: { userId: supervisorUsers[2].id, name: 'Amit Sharma', phone: '9876543212', area: 'Dadar' } }),
  ]);

  // ── 12 Workers ──
  const workerData = [
    { name: 'Ramesh Yadav', empId: 'MHG-W001', phone: '9898001001', supervisor: 0, blood: 'A+', ecName: 'Sunita Yadav', ecPhone: '9898002001' },
    { name: 'Sunil Gupta', empId: 'MHG-W002', phone: '9898001002', supervisor: 0, blood: 'B+', ecName: 'Priya Gupta', ecPhone: '9898002002' },
    { name: 'Deepak Verma', empId: 'MHG-W003', phone: '9898001003', supervisor: 0, blood: 'O+', ecName: 'Rekha Verma', ecPhone: '9898002003' },
    { name: 'Manoj Singh', empId: 'MHG-W004', phone: '9898001004', supervisor: 0, blood: 'AB+', ecName: 'Geeta Singh', ecPhone: '9898002004' },
    { name: 'Vikram Jadhav', empId: 'MHG-W005', phone: '9898001005', supervisor: 1, blood: 'A-', ecName: 'Meena Jadhav', ecPhone: '9898002005' },
    { name: 'Arun Pawar', empId: 'MHG-W006', phone: '9898001006', supervisor: 1, blood: 'B+', ecName: 'Anita Pawar', ecPhone: '9898002006' },
    { name: 'Prakash Deshmukh', empId: 'MHG-W007', phone: '9898001007', supervisor: 1, blood: 'O-', ecName: 'Kavita Deshmukh', ecPhone: '9898002007' },
    { name: 'Santosh Nikam', empId: 'MHG-W008', phone: '9898001008', supervisor: 1, blood: 'A+', ecName: 'Lata Nikam', ecPhone: '9898002008' },
    { name: 'Ganesh Shinde', empId: 'MHG-W009', phone: '9898001009', supervisor: 2, blood: 'B-', ecName: 'Suman Shinde', ecPhone: '9898002009' },
    { name: 'Ravi Kamble', empId: 'MHG-W010', phone: '9898001010', supervisor: 2, blood: 'O+', ecName: 'Radha Kamble', ecPhone: '9898002010' },
    { name: 'Kiran More', empId: 'MHG-W011', phone: '9898001011', supervisor: 2, blood: 'AB-', ecName: 'Jyoti More', ecPhone: '9898002011' },
    { name: 'Ashok Bhosle', empId: 'MHG-W012', phone: '9898001012', supervisor: 2, blood: 'A+', ecName: 'Nanda Bhosle', ecPhone: '9898002012' },
  ];

  const workerUsers = await Promise.all(
    workerData.map((w, i) =>
      prisma.user.create({ data: { email: `worker${i + 1}@manholeguard.in`, passwordHash, role: 'WORKER', language: i < 4 ? 'en' : i < 8 ? 'hi' : 'mr' } })
    )
  );

  const workers = await Promise.all(
    workerData.map((w, i) =>
      prisma.worker.create({
        data: {
          userId: workerUsers[i].id,
          employeeId: w.empId,
          name: w.name,
          phone: w.phone,
          supervisorId: supervisors[w.supervisor].id,
          bloodGroup: w.blood,
          emergencyContactName: w.ecName,
          emergencyContactPhone: w.ecPhone,
        },
      })
    )
  );

  // ── 40 Manholes across 6 Mumbai areas ──
  const areas = [
    { name: 'Andheri', baseLat: 19.1197, baseLng: 72.8464 },
    { name: 'Bandra', baseLat: 19.0544, baseLng: 72.8402 },
    { name: 'Dadar', baseLat: 19.0178, baseLng: 72.8478 },
    { name: 'Worli', baseLat: 19.0176, baseLng: 72.8152 },
    { name: 'Kurla', baseLat: 19.0726, baseLng: 72.8794 },
    { name: 'Sion', baseLat: 19.0434, baseLng: 72.8624 },
  ];

  const manholes = [];
  for (let i = 0; i < 40; i++) {
    const area = areas[i % areas.length];
    const lat = area.baseLat + (Math.random() - 0.5) * 0.02;
    const lng = area.baseLng + (Math.random() - 0.5) * 0.02;
    const riskScore = Math.floor(Math.random() * 100);
    const riskLevel: RiskLevel = riskScore < 30 ? 'SAFE' : riskScore < 60 ? 'CAUTION' : 'PROHIBITED';
    const hasGas = i % 5 === 0; // every 5th has gas sensor

    const m = await prisma.manhole.create({
      data: {
        qrCodeId: `MH-${area.name.substring(0, 3).toUpperCase()}-${String(i + 1).padStart(3, '0')}`,
        latitude: lat,
        longitude: lng,
        area: area.name,
        address: `${area.name} Ward, Mumbai`,
        depth: 2 + Math.random() * 4,
        diameter: 0.6 + Math.random() * 0.4,
        maxWorkers: Math.random() > 0.7 ? 3 : 2,
        riskLevel,
        riskScore,
        geoFenceRadius: 50,
        hasGasSensor: hasGas,
        sensorDeviceId: hasGas ? `SENSOR-${String(i + 1).padStart(3, '0')}` : undefined,
        lastCleanedAt: new Date(Date.now() - Math.random() * 90 * 86400000),
      },
    });
    manholes.push(m);
  }

  // ── 3 Shifts ──
  const shifts = await Promise.all([
    prisma.shift.create({ data: { workerId: workers[0].id, startTime: new Date(Date.now() - 4 * 3600000), status: 'ACTIVE', entryCount: 2, totalUndergroundMinutes: 55, fatigueScore: 35 } }),
    prisma.shift.create({ data: { workerId: workers[1].id, startTime: new Date(Date.now() - 8 * 3600000), endTime: new Date(Date.now() - 1 * 3600000), status: 'COMPLETED', entryCount: 3, totalUndergroundMinutes: 95, fatigueScore: 65 } }),
    prisma.shift.create({ data: { workerId: workers[4].id, startTime: new Date(Date.now() - 6 * 3600000), status: 'ACTIVE', entryCount: 1, totalUndergroundMinutes: 30, fatigueScore: 20 } }),
  ]);

  // ── 5 Tasks ──
  for (let i = 0; i < 5; i++) {
    await prisma.task.create({
      data: {
        supervisorId: supervisors[i % 3].id,
        manholeId: manholes[i * 3].id,
        assignedWorkerIds: [workers[i].id, workers[i + 1].id],
        taskType: ['cleaning', 'inspection', 'repair', 'cleaning', 'emergency'][i],
        description: `Task ${i + 1}: ${['Routine cleaning', 'Quarterly inspection', 'Structural repair', 'Post-monsoon cleaning', 'Emergency blockage clearance'][i]}`,
        allowedDuration: [45, 60, 90, 45, 30][i],
        priority: ['normal', 'normal', 'high', 'normal', 'urgent'][i],
        status: ['completed', 'in_progress', 'pending', 'completed', 'pending'][i],
        startedAt: i < 2 ? new Date(Date.now() - (5 - i) * 86400000) : undefined,
        completedAt: i === 0 || i === 3 ? new Date(Date.now() - (4 - i) * 86400000) : undefined,
      },
    });
  }

  // ── 60 Historical Entry Logs ──
  for (let i = 0; i < 60; i++) {
    const worker = workers[i % workers.length];
    const manhole = manholes[i % manholes.length];
    const daysAgo = Math.floor(Math.random() * 30);
    const entryTime = new Date(Date.now() - daysAgo * 86400000 - Math.random() * 8 * 3600000);
    const duration = 20 + Math.floor(Math.random() * 40);
    const isExited = i < 55;
    const isOverstay = !isExited && i < 58;

    await prisma.entryLog.create({
      data: {
        workerId: worker.id,
        manholeId: manhole.id,
        shiftId: i < 3 ? shifts[i % shifts.length].id : undefined,
        entryTime,
        exitTime: isExited ? new Date(entryTime.getTime() + duration * 60000) : undefined,
        allowedDurationMinutes: 45,
        status: isExited ? 'EXITED' : isOverstay ? 'OVERSTAY_ALERT' : 'ACTIVE',
        state: isExited ? 'EXITED' : isOverstay ? 'OVERSTAY_ALERT' : 'ACTIVE',
        geoLatitude: manhole.latitude + (Math.random() - 0.5) * 0.0005,
        geoLongitude: manhole.longitude + (Math.random() - 0.5) * 0.0005,
        geoVerified: Math.random() > 0.1,
        checklistCompleted: Math.random() > 0.05,
        teamEntryId: i % 10 === 0 ? undefined : undefined,
      },
    });
  }

  // ── 15 Incidents ──
  const incidentTypes = ['overstay', 'gas_leak', 'structural_damage', 'flooding', 'equipment_failure', 'injury', 'SOS_EMERGENCY'];
  for (let i = 0; i < 15; i++) {
    await prisma.incident.create({
      data: {
        manholeId: manholes[i % manholes.length].id,
        workerId: i < 10 ? workers[i % workers.length].id : undefined,
        incidentType: incidentTypes[i % incidentTypes.length],
        description: `Incident ${i + 1} description`,
        severity: (['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as IncidentSeverity[])[i % 4],
        resolved: i < 10,
        resolvedAt: i < 10 ? new Date(Date.now() - (15 - i) * 86400000) : undefined,
        timestamp: new Date(Date.now() - i * 2 * 86400000),
      },
    });
  }

  // ── 25 Blockages ──
  for (let i = 0; i < 25; i++) {
    await prisma.blockage.create({
      data: {
        manholeId: manholes[i % manholes.length].id,
        reportedAt: new Date(Date.now() - i * 3 * 86400000),
        resolvedAt: i < 18 ? new Date(Date.now() - (i * 3 - 1) * 86400000) : undefined,
        severity: (['LOW', 'MEDIUM', 'LOW', 'HIGH'] as IncidentSeverity[])[i % 4],
      },
    });
  }

  // ── 100 Gas Readings ──
  for (let i = 0; i < 100; i++) {
    const manholeIdx = i % 8; // gas-sensor manholes (every 5th)
    const manhole = manholes[manholeIdx * 5] || manholes[0];
    const isDangerous = i % 20 === 0;

    await prisma.gasReading.create({
      data: {
        manholeId: manhole.id,
        h2s: isDangerous ? 25 : Math.random() * 8,
        ch4: isDangerous ? 6000 : Math.random() * 800,
        co: isDangerous ? 120 : Math.random() * 30,
        o2: isDangerous ? 18 : 20 + Math.random() * 1,
        co2: Math.random() * 3000,
        nh3: Math.random() * 20,
        temperature: 25 + Math.random() * 10,
        humidity: 60 + Math.random() * 30,
        isDangerous,
        alertTriggered: isDangerous,
        source: i % 3 === 0 ? 'manual' : 'sensor',
        readAt: new Date(Date.now() - i * 0.5 * 3600000),
      },
    });
  }

  // ── 30 Check-Ins ──
  const entryLogs = await prisma.entryLog.findMany({ take: 10 });
  for (let i = 0; i < 30; i++) {
    const entry = entryLogs[i % entryLogs.length];
    const wasOnTime = i % 5 !== 0;
    await prisma.checkIn.create({
      data: {
        entryLogId: entry.id,
        workerId: entry.workerId,
        promptedAt: new Date(Date.now() - (30 - i) * 600000),
        respondedAt: wasOnTime ? new Date(Date.now() - (30 - i) * 600000 + 20000) : undefined,
        wasOnTime,
        method: ['tap', 'tap', 'shake', 'tap', 'voice'][i % 5],
      },
    });
  }

  // ── 20 Health Checks ──
  const exitedEntries = await prisma.entryLog.findMany({ where: { status: 'EXITED' }, take: 20 });
  for (let i = 0; i < Math.min(20, exitedEntries.length); i++) {
    const isSymptomatic = i % 4 === 0;
    await prisma.healthCheck.create({
      data: {
        entryLogId: exitedEntries[i].id,
        workerId: exitedEntries[i].workerId,
        feelingOk: !isSymptomatic,
        symptoms: isSymptomatic ? ['dizziness', 'headache'] : [],
        needsMedical: isSymptomatic && i % 8 === 0,
      },
    });
  }

  // ── 8 Worker Certifications ──
  const certTypes: CertificationType[] = ['SAFETY_TRAINING', 'CONFINED_SPACE', 'MEDICAL_FITNESS', 'FIRST_AID', 'GAS_DETECTION', 'PPE_USAGE'];
  for (let i = 0; i < 8; i++) {
    const isExpired = i >= 6;
    await prisma.workerCertification.create({
      data: {
        workerId: workers[i % workers.length].id,
        type: certTypes[i % certTypes.length],
        certificateNumber: `CERT-${2024}-${String(i + 1).padStart(4, '0')}`,
        issuedAt: new Date(Date.now() - 300 * 86400000),
        expiresAt: isExpired ? new Date(Date.now() - 10 * 86400000) : new Date(Date.now() + 180 * 86400000),
        issuedBy: 'Mumbai Municipal Corporation',
        isValid: !isExpired,
      },
    });
  }

  // ── 15 Maintenance Records ──
  for (let i = 0; i < 15; i++) {
    const isOverdue = i >= 12;
    await prisma.maintenance.create({
      data: {
        manholeId: manholes[i % manholes.length].id,
        type: ['cleaning', 'structural', 'sensor_calibration'][i % 3],
        status: isOverdue ? 'OVERDUE' : (['COMPLETED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'] as MaintenanceStatus[])[i % 4],
        scheduledAt: new Date(Date.now() + (i - 10) * 7 * 86400000),
        completedAt: i % 4 === 0 || i % 4 === 3 ? new Date(Date.now() - (10 - i) * 86400000) : undefined,
        assignedTeam: `Team ${(i % 3) + 1}`,
        autoGenerated: i % 2 === 0,
      },
    });
  }

  // ── 5 Grievances ──
  const grievanceTypes = ['open_manhole', 'overflow', 'foul_smell', 'blockage', 'structural_damage'];
  const grievanceStatuses: GrievanceStatus[] = ['SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
  for (let i = 0; i < 5; i++) {
    await prisma.grievance.create({
      data: {
        manholeId: manholes[i * 5].id,
        reporterName: ['Priya Nair', 'Ashwin Mehta', 'Fatima Khan', 'John D\'Souza', 'Deepa Iyer'][i],
        reporterPhone: `98765${43200 + i}`,
        reporterEmail: i % 2 === 0 ? `citizen${i + 1}@email.com` : undefined,
        issueType: grievanceTypes[i],
        description: `Grievance ${i + 1}: ${['Open manhole cover near school', 'Sewage overflow on main road', 'Strong foul smell near residential area', 'Drain blockage causing water logging', 'Cracked manhole structure'][i]}`,
        latitude: manholes[i * 5].latitude,
        longitude: manholes[i * 5].longitude,
        address: `Near ${manholes[i * 5].area} station, Mumbai`,
        status: grievanceStatuses[i],
        trackingCode: `MHG-2026-${String(10001 + i)}`,
        resolvedAt: i === 3 ? new Date(Date.now() - 2 * 86400000) : undefined,
        resolutionNotes: i === 3 ? 'Manhole cover replaced and area cleaned' : undefined,
      },
    });
  }

  // ── 50 Audit Log Entries ──
  const auditActions: AuditAction[] = ['CREATE', 'UPDATE', 'SCAN', 'ENTRY_START', 'ENTRY_EXIT', 'ALERT_TRIGGERED', 'LOGIN', 'CHECKIN_RESPONSE'];
  let prevHash = 'GENESIS';
  for (let i = 0; i < 50; i++) {
    const action = auditActions[i % auditActions.length];
    const payload = JSON.stringify({ previousHash: prevHash, action, entityType: 'entry_log', entityId: `audit-${i}`, userId: admin.id, timestamp: new Date(Date.now() - (50 - i) * 3600000).toISOString() });
    const crypto = await import('crypto');
    const hash = crypto.createHash('sha256').update(payload).digest('hex');

    await prisma.auditLog.create({
      data: {
        userId: [admin.id, ...supervisorUsers.map(u => u.id), ...workerUsers.slice(0, 3).map(u => u.id)][i % 7],
        action,
        entityType: ['entry_log', 'manhole', 'worker', 'incident', 'shift'][i % 5],
        entityId: `entity-${i}`,
        hashChain: hash,
        timestamp: new Date(Date.now() - (50 - i) * 3600000),
      },
    });

    prevHash = hash;
  }

  console.log('Seed complete!');
  console.log(`Created: 1 admin, 3 supervisors, 12 workers, 40 manholes, 60 entries, 15 incidents, 25 blockages, 100 gas readings, 30 check-ins, 20 health checks, 8 certifications, 15 maintenance, 5 grievances, 50 audit logs`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
