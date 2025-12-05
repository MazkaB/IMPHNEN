# Security Guidelines

## 🔐 Environment Variables

### JANGAN PERNAH:
- Commit file `.env.local` ke repository
- Hardcode API keys di source code
- Expose server-side keys ke client
- Share credentials via chat/email

### SELALU:
- Gunakan `.env.example` sebagai template
- Simpan credentials di environment variables
- Rotate API keys secara berkala
- Gunakan secrets manager di production

---

## 🛡️ Authentication

### Firebase Auth
- Semua protected routes memerlukan authentication
- Token divalidasi di setiap API request
- Session timeout: 1 jam (configurable)

### Token Validation
```typescript
// Server-side validation
const { adminAuth } = getAdminFirebase();
const decodedToken = await adminAuth.verifyIdToken(token);
```

### Password Requirements
- Minimum 8 karakter
- Harus mengandung huruf besar
- Harus mengandung huruf kecil
- Harus mengandung angka

---

## 🔒 API Security

### Authorization Header
```
Authorization: Bearer <firebase_id_token>
```

### Request Validation
- Semua input divalidasi dengan Zod schema
- Input di-sanitize sebelum diproses
- SQL injection tidak mungkin (NoSQL database)

### Rate Limiting
- Implementasi rate limiting di production
- Gunakan Redis untuk distributed rate limiting

---

## 📱 WhatsApp Webhook Security

### Twilio Signature Validation
```typescript
const isValid = twilio.validateRequest(
  authToken,
  signature,
  url,
  params
);
```

### PENTING:
- Selalu validasi signature dari Twilio
- Jangan proses request tanpa validasi
- Log suspicious requests

---

## 🗄️ Database Security

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null 
        && resource.data.userId == request.auth.uid;
    }
  }
}
```

### Data Encryption
- Data at rest: Encrypted by Firebase
- Data in transit: HTTPS only
- Sensitive data: Additional encryption layer

---

## 🔑 API Keys Management

### OpenAI
- Gunakan API key dengan rate limits
- Monitor usage di dashboard
- Set spending limits

### Twilio
- Gunakan sub-accounts untuk isolation
- Enable 2FA di Twilio console
- Whitelist webhook URLs

### Firebase
- Restrict API key di Firebase Console
- Enable App Check untuk mobile apps
- Monitor authentication events

---

## 🚨 Incident Response

### Jika API Key Bocor:
1. Revoke key immediately
2. Generate new key
3. Update environment variables
4. Deploy ulang aplikasi
5. Audit access logs
6. Notify team

### Jika Data Breach:
1. Isolate affected systems
2. Assess scope of breach
3. Notify affected users
4. Report to authorities (jika diperlukan)
5. Implement fixes
6. Post-mortem analysis

---

## ✅ Security Checklist

### Development
- [ ] `.env.local` di `.gitignore`
- [ ] Tidak ada hardcoded credentials
- [ ] Input validation di semua endpoints
- [ ] Error messages tidak expose internal info

### Deployment
- [ ] HTTPS enabled
- [ ] Environment variables configured
- [ ] Firestore rules deployed
- [ ] Rate limiting enabled
- [ ] Logging configured

### Monitoring
- [ ] Error tracking (Sentry, etc.)
- [ ] Access logs enabled
- [ ] Anomaly detection
- [ ] Regular security audits

---

## 📞 Contact

Jika menemukan security vulnerability:
- Jangan publish secara publik
- Hubungi tim security langsung
- Provide detailed report
