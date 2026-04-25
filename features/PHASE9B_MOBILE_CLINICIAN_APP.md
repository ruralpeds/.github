# Phase 9B: Mobile Clinician Application — iOS & Android

**Status:** 🚧 ARCHITECTURE DESIGN  
**Target Timeline:** July 2026 — October 2026  
**Platforms:** iOS 14+, Android 11+  
**Deliverables:** Native mobile apps with offline capability, push notifications, clinical workflows

---

## Overview

Phase 9B delivers native iOS and Android applications that enable clinicians to:
- Receive and respond to critical alerts on their mobile devices
- View patient dashboards with real-time vital signs
- Document clinical actions (acknowledging alerts, recording interventions)
- Access patient history and trends
- Work offline with local data sync

---

## Architecture Overview

### Tech Stack

**Frontend:**
- **iOS:** SwiftUI (native, Apple ecosystem optimized)
- **Android:** Jetpack Compose (modern native, Google ecosystem)
- **Shared Logic:** Kotlin Multiplatform Mobile (KMM) for shared business logic

**Backend Connection:**
- REST API over HTTPS/TLS 1.2+
- WebSocket for real-time push notifications
- Local SQLite database for offline-first capability

**Security:**
- Certificate pinning (prevent MITM attacks)
- Local biometric authentication (fingerprint/Face ID)
- End-to-end encryption for sensitive fields
- Automatic session timeout (5 min inactivity)

### Data Model

```swift
// iOS: DataModel.swift (Shared across app)

struct Alert: Identifiable, Codable {
    let id: String
    let patientId: String
    let patientName: String
    let alertType: AlertType  // hypoglycemia, sepsis, etc
    let severity: Severity    // P1/P2/P3
    let value: Double         // glucose, HR, etc
    let threshold: Double     // What value triggered alert
    let timestamp: Date
    var status: AlertStatus   // unread, acknowledged, resolved
    let vitals: VitalSigns
    
    var timeAgo: String {
        let interval = Date().timeIntervalSince(timestamp)
        if interval < 60 { return "Just now" }
        if interval < 3600 { return "\(Int(interval/60))m ago" }
        return "\(Int(interval/3600))h ago"
    }
}

struct VitalSigns: Codable {
    let glucose: Double?
    let heartRate: Int?
    let systolicBp: Int?
    let diastolicBp: Int?
    let spo2: Int?
    let temperature: Double?
    let timestamp: Date
}

struct Patient: Identifiable, Codable {
    let id: String
    let name: String
    let mrn: String  // Medical Record Number
    let age: Int
    let gender: String
    let comorbidities: [String]
    let allergies: [String]
    let currentMedications: [Medication]
    let recentVitals: VitalSigns?
    let riskScore: Int  // 0-100 from predictive analytics
}
```

---

## Component 1: iOS Application

### Home Screen (Alert Dashboard)

```swift
// iOS/AlertDashboardView.swift

struct AlertDashboardView: View {
    @StateObject var viewModel: AlertDashboardViewModel
    @State var alerts: [Alert] = []
    @State var selectedAlert: Alert?
    
    var body: some View {
        NavigationView {
            ZStack {
                VStack {
                    // Alert Summary
                    HStack(spacing: 16) {
                        VStack(alignment: .leading) {
                            Text("Critical (P1)").font(.caption)
                            Text("\(viewModel.criticalAlerts.count)").font(.title)
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.red.opacity(0.1))
                        .cornerRadius(8)
                        
                        VStack(alignment: .leading) {
                            Text("High (P2)").font(.caption)
                            Text("\(viewModel.highAlerts.count)").font(.title)
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.orange.opacity(0.1))
                        .cornerRadius(8)
                        
                        VStack(alignment: .leading) {
                            Text("Medium (P3)").font(.caption)
                            Text("\(viewModel.mediumAlerts.count)").font(.title)
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.yellow.opacity(0.1))
                        .cornerRadius(8)
                    }
                    .padding()
                    
                    // Alert List
                    List {
                        // Critical alerts first
                        Section(header: Text("CRITICAL ALERTS").font(.headline).foregroundColor(.red)) {
                            ForEach(viewModel.criticalAlerts, id: \.id) { alert in
                                AlertRowView(alert: alert)
                                    .onTapGesture {
                                        selectedAlert = alert
                                    }
                            }
                        }
                        
                        // High alerts
                        if !viewModel.highAlerts.isEmpty {
                            Section(header: Text("HIGH PRIORITY").font(.headline).foregroundColor(.orange)) {
                                ForEach(viewModel.highAlerts) { alert in
                                    AlertRowView(alert: alert)
                                        .onTapGesture { selectedAlert = alert }
                                }
                            }
                        }
                        
                        // Medium alerts
                        if !viewModel.mediumAlerts.isEmpty {
                            Section(header: Text("OTHER ALERTS").font(.headline).foregroundColor(.yellow)) {
                                ForEach(viewModel.mediumAlerts) { alert in
                                    AlertRowView(alert: alert)
                                        .onTapGesture { selectedAlert = alert }
                                }
                            }
                        }
                    }
                    .refreshable {
                        await viewModel.refreshAlerts()
                    }
                }
                
                // Detail sheet
                if let alert = selectedAlert {
                    AlertDetailView(alert: alert, isPresented: $selectedAlert.!=)
                }
            }
            .navigationTitle("Alerts")
            .onAppear {
                viewModel.startListeningForAlerts()
            }
        }
    }
}

struct AlertRowView: View {
    let alert: Alert
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                VStack(alignment: .leading) {
                    Text(alert.patientName).font(.headline)
                    Text("MRN: \(alert.patientId)").font(.caption).foregroundColor(.gray)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                
                Text(alert.timeAgo).font(.caption).foregroundColor(.gray)
            }
            
            HStack {
                Text(alert.alertType.description).font(.subheadline)
                Spacer()
                Text(String(format: "%.0f", alert.value))
                    .font(.body)
                    .fontWeight(.bold)
            }
            
            ProgressView(
                value: alert.value,
                total: alert.threshold * 1.2
            )
            .tint(alert.severity == .p1 ? .red : alert.severity == .p2 ? .orange : .yellow)
        }
        .padding(.vertical, 8)
    }
}
```

### Alert Response Workflow

```swift
// iOS/AlertDetailView.swift

struct AlertDetailView: View {
    @StateObject var viewModel: AlertDetailViewModel
    let alert: Alert
    @Binding var isPresented: Bool
    
    @State var selectedAction: AlertAction?
    @State var interventionNotes: String = ""
    
    var body: some View {
        NavigationView {
            VStack(spacing: 16) {
                // Patient Info
                PatientCardView(patient: viewModel.patient)
                
                // Alert Details
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Text("Alert Type").font(.caption).foregroundColor(.gray)
                        Spacer()
                        Text(alert.alertType.description).font(.body).fontWeight(.bold)
                    }
                    
                    HStack {
                        Text("Value").font(.caption).foregroundColor(.gray)
                        Spacer()
                        HStack(spacing: 4) {
                            Text(String(format: "%.1f", alert.value)).font(.body).fontWeight(.bold)
                            Text("(threshold: \(String(format: "%.1f", alert.threshold)))").font(.caption)
                        }
                    }
                    
                    HStack {
                        Text("Time").font(.caption).foregroundColor(.gray)
                        Spacer()
                        Text(alert.timestamp.formatted()).font(.caption)
                    }
                }
                .padding()
                .background(Color.gray.opacity(0.05))
                .cornerRadius(8)
                
                // Clinical Actions
                VStack(alignment: .leading, spacing: 12) {
                    Text("Actions").font(.headline)
                    
                    Button(action: { selectedAction = .acknowledged }) {
                        Label("Acknowledge Alert", systemImage: "checkmark.circle")
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.blue)
                            .foregroundColor(.white)
                            .cornerRadius(8)
                    }
                    
                    Button(action: { selectedAction = .documentIntervention }) {
                        Label("Document Intervention", systemImage: "pencil.circle")
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.green)
                            .foregroundColor(.white)
                            .cornerRadius(8)
                    }
                    
                    Button(action: { selectedAction = .escalate }) {
                        Label("Escalate to Physician", systemImage: "phone.circle")
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.red)
                            .foregroundColor(.white)
                            .cornerRadius(8)
                    }
                }
                
                Spacer()
            }
            .padding()
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Close") { isPresented = false }
                }
            }
            .sheet(item: $selectedAction) { action in
                switch action {
                case .acknowledged:
                    AcknowledgementView(
                        alert: alert,
                        onConfirm: { 
                            viewModel.acknowledgeAlert(alert)
                            isPresented = false
                        }
                    )
                case .documentIntervention:
                    InterventionDocumentationView(
                        alert: alert,
                        onSave: { intervention in
                            viewModel.recordIntervention(alert, intervention)
                            isPresented = false
                        }
                    )
                case .escalate:
                    EscalationView(alert: alert)
                }
            }
        }
    }
}

struct InterventionDocumentationView: View {
    let alert: Alert
    let onSave: (ClinicalIntervention) -> Void
    
    @State var interventionType: InterventionType = .monitoring
    @State var notes: String = ""
    @State var medications: [String] = []
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Intervention Type")) {
                    Picker("Type", selection: $interventionType) {
                        Text("Monitoring").tag(InterventionType.monitoring)
                        Text("Medication").tag(InterventionType.medication)
                        Text("Fluids").tag(InterventionType.fluids)
                        Text("Oxygen").tag(InterventionType.oxygen)
                        Text("Other").tag(InterventionType.other)
                    }
                }
                
                Section(header: Text("Clinical Notes")) {
                    TextEditor(text: $notes)
                        .frame(height: 100)
                }
                
                Button("Save Intervention") {
                    let intervention = ClinicalIntervention(
                        alertId: alert.id,
                        type: interventionType,
                        notes: notes,
                        timestamp: Date()
                    )
                    onSave(intervention)
                    dismiss()
                }
            }
            .navigationTitle("Document Intervention")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}
```

---

## Component 2: Android Application

### Jetpack Compose Implementation

```kotlin
// Android: AlertDashboardScreen.kt

@Composable
fun AlertDashboardScreen(
    viewModel: AlertDashboardViewModel = hiltViewModel()
) {
    val alerts by viewModel.alerts.collectAsState()
    val criticalAlerts = alerts.filter { it.severity == AlertSeverity.P1 }
    val highAlerts = alerts.filter { it.severity == AlertSeverity.P2 }
    val mediumAlerts = alerts.filter { it.severity == AlertSeverity.P3 }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Alerts") },
                colors = TopAppBarDefaults.smallTopAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary
                )
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(8.dp)
        ) {
            // Summary cards
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    SummaryCard(
                        title = "Critical",
                        count = criticalAlerts.size,
                        color = Color.Red,
                        modifier = Modifier
                            .weight(1f)
                            .height(80.dp)
                    )
                    SummaryCard(
                        title = "High",
                        count = highAlerts.size,
                        color = Color(0xFFFFA500),
                        modifier = Modifier
                            .weight(1f)
                            .height(80.dp)
                    )
                    SummaryCard(
                        title = "Medium",
                        count = mediumAlerts.size,
                        color = Color.Yellow,
                        modifier = Modifier
                            .weight(1f)
                            .height(80.dp)
                    )
                }
            }
            
            // Critical alerts
            if (criticalAlerts.isNotEmpty()) {
                item {
                    Text(
                        "CRITICAL ALERTS",
                        style = MaterialTheme.typography.titleMedium,
                        modifier = Modifier.padding(8.dp)
                    )
                }
                items(criticalAlerts) { alert ->
                    AlertCard(alert = alert, severity = AlertSeverity.P1)
                }
            }
            
            // High priority
            if (highAlerts.isNotEmpty()) {
                item {
                    Text(
                        "HIGH PRIORITY",
                        style = MaterialTheme.typography.titleMedium,
                        modifier = Modifier.padding(top = 16.dp, start = 8.dp)
                    )
                }
                items(highAlerts) { alert ->
                    AlertCard(alert = alert, severity = AlertSeverity.P2)
                }
            }
            
            // Other alerts
            if (mediumAlerts.isNotEmpty()) {
                item {
                    Text(
                        "OTHER ALERTS",
                        style = MaterialTheme.typography.titleMedium,
                        modifier = Modifier.padding(top = 16.dp, start = 8.dp)
                    )
                }
                items(mediumAlerts) { alert ->
                    AlertCard(alert = alert, severity = AlertSeverity.P3)
                }
            }
        }
    }
}

@Composable
fun AlertCard(
    alert: Alert,
    severity: AlertSeverity
) {
    val backgroundColor = when (severity) {
        AlertSeverity.P1 -> Color.Red.copy(alpha = 0.1f)
        AlertSeverity.P2 -> Color(0xFFFFA500).copy(alpha = 0.1f)
        AlertSeverity.P3 -> Color.Yellow.copy(alpha = 0.1f)
    }
    
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp),
        backgroundColor = backgroundColor,
        shape = RoundedCornerShape(8.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(alert.patientName, style = MaterialTheme.typography.bodyLarge)
                    Text(
                        "MRN: ${alert.patientId}",
                        style = MaterialTheme.typography.labelSmall
                    )
                }
                Text(alert.timeAgo, style = MaterialTheme.typography.labelSmall)
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(alert.alertType.description)
                Text(String.format("%.1f", alert.value))
            }
            
            LinearProgressIndicator(
                progress = (alert.value / (alert.threshold * 1.2f)).toFloat(),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 8.dp)
            )
        }
    }
}
```

---

## Component 3: Push Notifications

### Real-Time Alert Delivery

```swift
// iOS: NotificationManager.swift

class NotificationManager: NSObject, UNUserNotificationCenterDelegate {
    static let shared = NotificationManager()
    
    func requestUserPermission() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
            if granted {
                DispatchQueue.main.async {
                    UIApplication.shared.registerForRemoteNotifications()
                }
            }
        }
    }
    
    func handleRemoteNotification(_ userInfo: [AnyHashable: Any]) {
        guard let alertJSON = userInfo["alert"] as? String else { return }
        
        do {
            let alert = try JSONDecoder().decode(Alert.self, from: alertJSON.data(using: .utf8)!)
            
            // Create rich notification
            let content = UNMutableNotificationContent()
            content.title = "ALERT: \(alert.alertType.description)"
            content.body = "\(alert.patientName) - \(String(format: "%.1f", alert.value))"
            content.sound = .default
            content.badge = NSNumber(value: UIApplication.shared.applicationIconBadgeNumber + 1)
            
            // Add custom data for deep linking
            content.userInfo = ["alertId": alert.id, "patientId": alert.patientId]
            
            // Vibration for P1 alerts
            if alert.severity == .p1 {
                content.interruptionLevel = .timeSensitive
                let generator = UINotificationFeedbackGenerator()
                generator.notificationOccurred(.error)
            }
            
            // Add response actions
            let acknowledgeAction = UNNotificationAction(
                identifier: "ACKNOWLEDGE",
                title: "Acknowledge",
                options: [.foreground]
            )
            let escalateAction = UNNotificationAction(
                identifier: "ESCALATE",
                title: "Escalate",
                options: [.foreground, .destructive]
            )
            let category = UNNotificationCategory(
                identifier: "ALERT_CATEGORY",
                actions: [acknowledgeAction, escalateAction],
                intentIdentifiers: [],
                options: []
            )
            UNUserNotificationCenter.current().setNotificationCategories([category])
            content.categoryIdentifier = "ALERT_CATEGORY"
            
            // Schedule notification
            let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
            let request = UNNotificationRequest(identifier: alert.id, content: content, trigger: trigger)
            UNUserNotificationCenter.current().add(request)
            
        } catch {
            print("Failed to decode alert: \(error)")
        }
    }
    
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        let alertId = response.notification.request.content.userInfo["alertId"] as? String
        
        switch response.actionIdentifier {
        case "ACKNOWLEDGE":
            // User acknowledged via notification action
            if let alertId = alertId {
                NetworkManager.shared.acknowledgeAlert(alertId)
            }
        case "ESCALATE":
            // User escalated via notification action
            if let alertId = alertId {
                NetworkManager.shared.escalateAlert(alertId)
            }
        case UNNotificationDefaultActionIdentifier:
            // User tapped notification — open app with deep link
            NotificationCenter.default.post(
                name: NSNotification.Name("AlertTapped"),
                object: alertId
            )
        default:
            break
        }
        
        completionHandler()
    }
}
```

---

## Component 4: Offline-First Architecture

### Local Data Sync

```swift
// iOS: LocalDataManager.swift

class LocalDataManager {
    let db = SQLiteDatabase()  // Local SQLite
    
    func syncAlertsWithServer(_ serverAlerts: [Alert]) {
        // Merge server alerts with local data
        let localAlerts = db.query("SELECT * FROM alerts")
        
        for serverAlert in serverAlerts {
            if let localAlert = localAlerts.first(where: { $0.id == serverAlert.id }) {
                // Update if server version is newer
                if serverAlert.timestamp > localAlert.timestamp {
                    db.update("alerts", serverAlert)
                }
            } else {
                // New alert from server
                db.insert("alerts", serverAlert)
            }
        }
        
        // Upload local changes to server
        let unsentAcknowledgments = db.query(
            "SELECT * FROM alert_responses WHERE synced = false"
        )
        for response in unsentAcknowledgments {
            NetworkManager.shared.uploadAlertResponse(response) { success in
                if success {
                    self.db.update("alert_responses", ["synced": true], 
                                  where: "id = '\(response.id)'")
                }
            }
        }
    }
    
    func getOfflineAlerts() -> [Alert] {
        return db.query("SELECT * FROM alerts ORDER BY timestamp DESC")
    }
    
    func recordLocalAlertAcknowledgment(_ alertId: String) {
        let response = AlertResponse(
            alertId: alertId,
            action: "acknowledged",
            timestamp: Date(),
            synced: false
        )
        db.insert("alert_responses", response)
    }
}
```

---

## Component 5: Security & Authentication

### Biometric Authentication + Session Management

```swift
// iOS: AuthenticationManager.swift

class AuthenticationManager: ObservableObject {
    @Published var isAuthenticated = false
    @Published var user: ClinicalUser?
    
    private let keychain = KeychainManager()
    private let sessionManager = SessionManager()
    
    func authenticateWithBiometrics() {
        let context = LAContext()
        var error: NSError?
        
        guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, 
                                       error: &error) else {
            print("Biometric authentication not available")
            return
        }
        
        context.evaluatePolicy(
            .deviceOwnerAuthenticationWithBiometrics,
            localizedReason: "Authenticate to access clinical alerts"
        ) { [weak self] success, error in
            DispatchQueue.main.async {
                if success {
                    // Retrieve cached JWT from keychain
                    if let jwt = self?.keychain.retrieve(key: "auth_token") {
                        self?.validateAndSetSession(jwt)
                    }
                } else {
                    print("Biometric authentication failed: \(error?.localizedDescription ?? "Unknown")")
                }
            }
        }
    }
    
    private func validateAndSetSession(_ jwt: String) {
        // Validate JWT signature hasn't been tampered with
        if sessionManager.validateJWT(jwt) {
            self.isAuthenticated = true
            self.sessionManager.startSessionTimeout()
        } else {
            // JWT invalid — clear and require re-authentication
            keychain.delete(key: "auth_token")
            self.isAuthenticated = false
        }
    }
    
    func logout() {
        keychain.delete(key: "auth_token")
        sessionManager.clearSession()
        isAuthenticated = false
    }
}

class SessionManager {
    private var sessionTimeout: Timer?
    private let timeoutDuration: TimeInterval = 5 * 60  // 5 minutes
    
    func startSessionTimeout() {
        sessionTimeout = Timer.scheduledTimer(withTimeInterval: timeoutDuration, repeats: false) { [weak self] _ in
            self?.clearSession()
            NotificationCenter.default.post(name: NSNotification.Name("SessionExpired"))
        }
    }
    
    func resetSessionTimeout() {
        sessionTimeout?.invalidate()
        startSessionTimeout()
    }
    
    func clearSession() {
        sessionTimeout?.invalidate()
    }
}
```

---

## Development Timeline

### Phase 9B Week-by-Week (July — October 2026)

**Week 1-2: Core Architecture**
- iOS: SwiftUI baseline, data models, networking layer
- Android: Jetpack Compose baseline, data models, networking layer
- Shared: API client library, authentication, encryption utilities

**Week 3-4: Alert Management**
- Alert dashboard (iOS & Android)
- Alert detail view (iOS & Android)
- Real-time WebSocket connection for alerts

**Week 5-6: Clinical Workflows**
- Alert acknowledgment workflow
- Intervention documentation
- Escalation procedures
- Offline sync capability

**Week 7-8: Push Notifications**
- APNs (Apple Push Notification service) integration
- FCM (Firebase Cloud Messaging) integration
- Rich notification handling
- Deep linking from notifications

**Week 9-10: Testing & Validation**
- Unit tests (SwiftUI, Jetpack Compose)
- Integration tests (API calls, database)
- E2E tests (realistic workflows)
- Security testing (certificate pinning, biometric auth)

**Week 11-12: Beta & Deployment**
- App Store submission (iOS)
- Google Play submission (Android)
- Beta testing with clinicians
- Performance optimization

---

## Success Criteria

| Criterion | Target | Validation |
|-----------|--------|------------|
| **Alert Delivery** | <5s from server to notification | Real-world testing |
| **Battery Impact** | <5% additional drain | Field testing |
| **Data Usage** | <10MB/month avg | Network monitoring |
| **Offline Capability** | Full functionality without connection | Airplane mode testing |
| **Biometric Auth** | 99.9% uptime | Continuous monitoring |
| **Clinician Satisfaction** | ≥4.5/5 stars | App store ratings |

---

**Status:** Architecture complete  
**Next Step:** Implementation (July 2026)  
**Blocking Items:** None — Ready to proceed post-FDA clearance
