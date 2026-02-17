import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// This would be fetched from Supabase in production
const auditLogs = [
  {
    id: '1',
    action: 'CREATE_PATIENT',
    user: 'Admin User',
    timestamp: '2024-02-15 14:30:22',
    resource: 'Patient: John Doe',
    details: 'Created new patient record',
  },
  {
    id: '2',
    action: 'RISK_ASSESSMENT',
    user: 'Manager User',
    timestamp: '2024-02-15 13:15:10',
    resource: 'Patient: Jane Wilson',
    details: 'Risk level updated to HIGH',
  },
  {
    id: '3',
    action: 'GENERATE_PAYROLL',
    user: 'Admin User',
    timestamp: '2024-02-15 10:00:00',
    resource: 'Payroll Period: Feb 1-15',
    details: 'Generated payroll for 32 caregivers',
  },
]

const complianceStatus = {
  caregiverCertifications: { total: 32, expiring: 3, expired: 0 },
  backgroundChecks: { total: 32, expiring: 2, expired: 0 },
  insurancePolicies: { total: 1, expiring: 0, expired: 0 },
  trainingRecords: { total: 32, expiring: 4, expired: 1 },
}

export default function CompliancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Compliance Dashboard</h1>
        <p className="text-muted-foreground">Monitor compliance status and audit logs</p>
      </div>

      {/* Compliance Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Certifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceStatus.caregiverCertifications.total}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="text-yellow-600">
                {complianceStatus.caregiverCertifications.expiring} expiring
              </Badge>
              {complianceStatus.caregiverCertifications.expired > 0 && (
                <Badge variant="outline" className="text-red-600">
                  {complianceStatus.caregiverCertifications.expired} expired
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Background Checks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceStatus.backgroundChecks.total}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="text-yellow-600">
                {complianceStatus.backgroundChecks.expiring} expiring
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Insurance Policies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceStatus.insurancePolicies.total}</div>
            <Badge variant="outline" className="text-green-600 mt-2">
              All current
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Training Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceStatus.trainingRecords.total}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="text-yellow-600">
                {complianceStatus.trainingRecords.expiring} expiring
              </Badge>
              {complianceStatus.trainingRecords.expired > 0 && (
                <Badge variant="outline" className="text-red-600">
                  {complianceStatus.trainingRecords.expired} expired
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {auditLogs.map((log) => (
              <div key={log.id} className="flex items-start justify-between border-b pb-4 last:border-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{log.action}</Badge>
                    <span className="text-sm text-muted-foreground">{log.user}</span>
                  </div>
                  <p className="text-sm font-medium">{log.resource}</p>
                  <p className="text-xs text-muted-foreground">{log.details}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {log.timestamp}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
