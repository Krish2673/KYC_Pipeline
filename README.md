# Playto KYC System

A full-stack KYC verification system with role-based workflows, state machine enforcement, and secure document handling.

---

## Overview

This system allows:

### Merchant
- Create and submit KYC  
- Upload documents  
- Track submission status  

### Reviewer
- View submission queue  
- Review KYC details  
- Approve / Reject with reason  

---

## Tech Stack

### Backend
- Django  
- Django REST Framework  
- Token Authentication  

### Frontend
- React  
- Axios  

---

## Project Structure

```
playto-kyc/
│
├── backend/
│   ├── config/
│   ├── kyc/
│   ├── manage.py
│
├── frontend/
│
├── EXPLAINER.md
└── README.md
```

---

## Local Setup

### 🔹 1. Backend Setup

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data
python manage.py runserver
```

### 🔹 2. Frontend Setup

```bash
cd frontend
npm install
npm start
```

## Test Users

| Role      | Username   | Password |
|-----------|------------|----------|
| Merchant  | merchant1  | test123  |
| Reviewer  | reviewer   | test123  |

---

## Authentication

This project uses **token-based authentication**.

For frontend demo, a simple user selector is used to switch between roles.

---

## Core Workflow

```
draft → submitted → under_review → approved / rejected / more_info_requested
```


---

# API Endpoints

### **Merchant**
- `POST /api/v1/kyc/create/`
- `POST /api/v1/kyc/{id}/submit/`
- `POST /api/v1/kyc/upload-doc/`

### **Reviewer**
- `GET /api/v1/review/queue/`
- `GET /api/v1/review/{id}/`
- `POST /api/v1/review/{id}/action/`
- `GET /api/v1/review/dashboard/`

---

## File Upload Rules

- Allowed types: **PDF, JPG, PNG**
- Max size: **5MB**
- Validated on backend

---

## SLA Tracking

Submissions older than **24 hours** are marked as:

```json
"at_risk": true
```

## Security Considerations
- Role-based access control (merchant / reviewer)
- Merchants can only access their own data
- Document uploads validate ownership
- State transitions enforced centrally

## Testing
Run:
```bash
python manage.py test
```

Includes tests for:

- Invalid state transition

## Deployment

**Backend:**
- Deployed on Render

**Frontend:**
- Deployed on Vercel

## Key Highlights

- Centralized state machine  
- Secure file validation  
- Dynamic SLA computation  
- Clean role-based architecture  
- End-to-end working UI  

## Future Improvements

- Reviewer assignment system  
- Async notifications (email/webhooks)  
- Better dashboard visualization  
- JWT-based auth  
