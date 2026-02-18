'use client'

import { useState } from 'react'
import { Plus, TrendingUp, TrendingDown, Users, UserCheck, AlertTriangle, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { NewPatientModal } from '@/components/modals/new-patient-modal'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

// Mock data - Replace with real API calls
const kpiData = {
  activePatients: 247,
  activePatientsTrend: 12,
  caregiversOnShift: 32,
  caregiversOnShiftTrend: -3,
  highRiskPatients: 18,
  highRiskPatientsTrend: 5,
  monthlyRevenue: 342500,
  monthlyRevenueTrend: 8.5,
}

const missedVisits = [
  { id: '1', patient: 'John Doe', caregiver: 'Sarah Smith', time: '09:00 AM', reason: 'No answer' },
  { id: '2', patient: 'Jane Wilson', caregiver: 'Mike Johnson', time: '11:30 AM', reason: 'Patient unavailable' },
  { id: '3', patient: 'Bob Anderson', caregiver: 'Lisa Brown', time: '02:00 PM', reason: 'Emergency' },
]

const certificationAlerts = [
  { id: '1', caregiver: 'Sarah Smith', document: 'CPR Certification', expiresIn: '3 days' },
  { id: '2', caregiver: 'Mike Johnson', document: 'Background Check', expiresIn: '7 days' },
  { id: '3', caregiver: 'Lisa Brown', document: 'First Aid Training', expiresIn: '14 days' },
]

const fraudAlerts = [
  { id: '1', caregiver: 'Unknown', patient: 'Mary Johnson', issue: 'Suspicious visit duration (5 min)', confidence: 85 },
  { id: '2', caregiver: 'Tom Davis', patient: 'Robert Lee', issue: 'Location mismatch (2.3 mi)', confidence: 72 },
]

const incidents = [
  { type: 'fall', count: 3, severity: 'high' },
  { type: 'medication_error', count: 1, severity: 'medium' },
  { type: 'behavioral', count: 2, severity: 'low' },
]

const revenueData = [
  { month: 'Jan', revenue: 285000 },
  { month: 'Feb', revenue: 298000 },
  { month: 'Mar', revenue: 315000 },
  { month: 'Apr', revenue: 322000 },
  { month: 'May', revenue: 335000 },
  { month: 'Jun', revenue: 342500 },
]

const visitCompletionData = [
  { month: 'Jan', rate: 94 },
  { month: 'Feb', rate: 92 },
  { month: 'Mar', rate: 95 },
  { month: 'Apr', rate: 93 },
  { month: 'May', rate: 96 },
  { month: 'Jun', rate: 97 },
]

const riskDistribution = [
  { name: 'Low', value: 156, color: '#10b981' },
  { name: 'Medium', value: 73, color: '#f59e0b' },
  { name: 'High', value: 18, color: '#ef4444' },
]

const caregiverPerformance = [
  { name: 'Sarah Smith', score: 98 },
  { name: 'Mike Johnson', score: 95 },
  { name: 'Lisa Brown', score: 93 },
  { name: 'Tom Davis', score: 88 },
  { name: 'Amy Wilson', score: 92 },
]

export default function DashboardPage() {
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header with New Patient Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
        </div>
        <Button 
          onClick={() => setIsNewPatientModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Patient Registration
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.activePatients}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              {kpiData.activePatientsTrend > 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                  <span className="text-green-600">+{kpiData.activePatientsTrend}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
                  <span className="text-red-600">{kpiData.activePatientsTrend}%</span>
                </>
              )}
              <span className="ml-1">from last month</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Caregivers On Shift</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.caregiversOnShift}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-blue-600">{kpiData.caregiversOnShift} active now</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Patients</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{kpiData.highRiskPatients}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1 text-red-600" />
              <span className="text-red-600">+{kpiData.highRiskPatientsTrend}</span>
              <span className="ml-1">need attention</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(kpiData.monthlyRevenue / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              <span className="text-green-600">+{kpiData.monthlyRevenueTrend}%</span>
              <span className="ml-1">from last month</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alert Panels */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Missed Visits Today */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Missed Visits Today</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {missedVisits.map((visit) => (
              <div key={visit.id} className="flex flex-col space-y-1 p-2 rounded bg-red-50 border border-red-100">
                <div className="text-sm font-medium">{visit.patient}</div>
                <div className="text-xs text-muted-foreground">{visit.caregiver} • {visit.time}</div>
                <Badge className="text-xs w-fit border">{visit.reason}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Certification Expiry Alerts */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Certification Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {certificationAlerts.map((alert) => (
              <div key={alert.id} className="flex flex-col space-y-1 p-2 rounded bg-yellow-50 border border-yellow-100">
                <div className="text-sm font-medium">{alert.caregiver}</div>
                <div className="text-xs text-muted-foreground">{alert.document}</div>
                <Badge className="text-xs w-fit text-yellow-700 border border-yellow-200">Expires in {alert.expiresIn}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Fraud Alerts */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Fraud Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {fraudAlerts.map((alert) => (
              <div key={alert.id} className="flex flex-col space-y-1 p-2 rounded bg-orange-50 border border-orange-100">
                <div className="text-sm font-medium">{alert.patient}</div>
                <div className="text-xs text-muted-foreground">{alert.caregiver}</div>
                <div className="text-xs text-red-600">{alert.issue}</div>
                <Badge className="text-xs w-fit border">{alert.confidence}% confidence</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Incident Summary */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Incident Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {incidents.map((incident, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded bg-gray-50 border border-gray-100">
                <div>
                  <div className="text-sm font-medium capitalize">{incident.type.replace('_', ' ')}</div>
                  <div className="text-xs text-muted-foreground">Count: {incident.count}</div>
                </div>
                <Badge 
                  className={
                    incident.severity === 'high' 
                      ? 'text-red-700 border-red-200' 
                      : incident.severity === 'medium'
                      ? 'text-yellow-700 border-yellow-200'
                      : 'text-green-700 border-green-200'
                  }
                >
                  {incident.severity}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Visit Completion Rate */}
        <Card>
          <CardHeader>
            <CardTitle>Visit Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={visitCompletionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[85, 100]} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Caregiver Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Top Caregiver Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={caregiverPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis domain={[80, 100]} />
                <Tooltip />
                <Bar dataKey="score" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* New Patient Modal */}
      <NewPatientModal 
        open={isNewPatientModalOpen} 
        onClose={() => setIsNewPatientModalOpen(false)} 
      />
    </div>
  )
}
