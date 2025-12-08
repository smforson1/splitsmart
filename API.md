# SplitSmart API Documentation

Base URL: `http://localhost:3000` (development) or your deployed backend URL

## Authentication

All API endpoints (except auth endpoints) require authentication using JWT tokens from Supabase Auth.

**Headers Required:**
```
Authorization: Bearer <access_token>
```

### Sign Up
**POST** `/api/auth/signup`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "message": "User created successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token"
  }
}
```

### Sign In
**POST** `/api/auth/signin`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Signed in successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token"
  }
}
```

### Sign Out
**POST** `/api/auth/signout`

**Response:** `200 OK`
```json
{
  "message": "Signed out successfully"
}
```

### Get Current User
**GET** `/api/auth/me`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "user_metadata": {
      "name": "John Doe"
    }
  }
}
```

---

## Groups

### Create Group
**POST** `/api/groups`

**Request Body:**
```json
{
  "name": "Roommates"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "name": "Roommates",
  "created_at": "2024-12-08T10:00:00.000Z",
  "updated_at": "2024-12-08T10:00:00.000Z"
}
```

### Get All Groups
**GET** `/api/groups`

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "Roommates",
    "member_count": 3,
    "role": "admin",
    "created_at": "2024-12-08T10:00:00.000Z",
    "updated_at": "2024-12-08T10:00:00.000Z"
  }
]
```

**Note:** Only returns groups the authenticated user has access to.

### Get Group Details
**GET** `/api/groups/:id`

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "name": "Roommates",
  "created_at": "2024-12-08T10:00:00.000Z",
  "updated_at": "2024-12-08T10:00:00.000Z",
  "members": [
    {
      "id": "uuid",
      "group_id": "uuid",
      "name": "Alice",
      "created_at": "2024-12-08T10:00:00.000Z"
    }
  ]
}
```

### Update Group
**PUT** `/api/groups/:id`

**Request Body:**
```json
{
  "name": "Updated Name"
}
```

**Response:** `200 OK`

### Delete Group
**DELETE** `/api/groups/:id`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Group deleted successfully"
}
```

---

## Members

### Add Member to Group
**POST** `/api/groups/:id/members`

**Request Body:**
```json
{
  "name": "Bob"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "group_id": "uuid",
  "name": "Bob",
  "created_at": "2024-12-08T10:00:00.000Z"
}
```

### Remove Member
**DELETE** `/api/members/:id`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Member removed successfully"
}
```

---

## Expenses

### Create Expense (Equal Split)
**POST** `/api/expenses`

**Request Body:**
```json
{
  "group_id": "uuid",
  "description": "Groceries",
  "amount": 100.00,
  "category": "food",
  "date": "2024-12-08",
  "paid_by_member_id": "uuid",
  "split_type": "equal",
  "split_data": ["member_id_1", "member_id_2", "member_id_3"]
}
```

### Create Expense (Custom Split)
**POST** `/api/expenses`

**Request Body:**
```json
{
  "group_id": "uuid",
  "description": "Dinner",
  "amount": 90.00,
  "category": "food",
  "date": "2024-12-08",
  "paid_by_member_id": "uuid",
  "split_type": "custom",
  "split_data": [
    { "member_id": "uuid1", "amount": 30.00 },
    { "member_id": "uuid2", "amount": 40.00 },
    { "member_id": "uuid3", "amount": 20.00 }
  ]
}
```

**Response:** `201 Created`

### Get Expenses
**GET** `/api/expenses?groupId=:id&category=food&startDate=2024-01-01&endDate=2024-12-31`

**Query Parameters:**
- `groupId` (required): Group UUID
- `category` (optional): Filter by category
- `startDate` (optional): Filter from date (YYYY-MM-DD)
- `endDate` (optional): Filter to date (YYYY-MM-DD)

**Response:** `200 OK`

### Get Expense Details
**GET** `/api/expenses/:id`

**Response:** `200 OK`

### Update Expense
**PUT** `/api/expenses/:id`

**Request Body:** Same as create expense

**Response:** `200 OK`

### Delete Expense
**DELETE** `/api/expenses/:id`

**Response:** `200 OK`

### Scan Receipt (AI)
**POST** `/api/expenses/scan`

**Request:** `multipart/form-data`
- `receipt`: Image file (JPG, PNG, etc.)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "total_amount": 45.67,
    "merchant_name": "Walmart",
    "date": "2024-12-08"
  },
  "receipt_url": "data:image/jpeg;base64,..."
}
```

---

## Balances

### Get Group Balances
**GET** `/api/balances/:groupId`

**Response:** `200 OK`
```json
{
  "balances": [
    {
      "member_id": "uuid",
      "member_name": "Alice",
      "balance": 50.00
    },
    {
      "member_id": "uuid",
      "member_name": "Bob",
      "balance": -25.00
    }
  ],
  "simplified_debts": [
    {
      "from_member_id": "uuid",
      "from_member_name": "Bob",
      "to_member_id": "uuid",
      "to_member_name": "Alice",
      "amount": 25.00
    }
  ]
}
```

---

## Settlements

### Record Settlement
**POST** `/api/settlements`

**Request Body:**
```json
{
  "group_id": "uuid",
  "from_member_id": "uuid",
  "to_member_id": "uuid",
  "amount": 25.00,
  "date": "2024-12-08",
  "notes": "Cash payment"
}
```

**Response:** `201 Created`

### Get Settlements
**GET** `/api/settlements?groupId=:id`

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "group_id": "uuid",
    "amount": 25.00,
    "date": "2024-12-08",
    "notes": "Cash payment",
    "created_at": "2024-12-08T10:00:00.000Z",
    "from_member": {
      "id": "uuid",
      "name": "Bob"
    },
    "to_member": {
      "id": "uuid",
      "name": "Alice"
    }
  }
]
```

---

## Error Responses

All endpoints may return these error responses:

**400 Bad Request**
```json
{
  "error": "Descriptive error message"
}
```

**401 Unauthorized**
```json
{
  "error": "Access token required"
}
```

**403 Forbidden**
```json
{
  "error": "Access denied to this resource"
}
```

**404 Not Found**
```json
{
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "error": "Failed to perform operation"
}
```

---

## Categories

Valid expense categories:
- `food`
- `utilities`
- `entertainment`
- `transportation`
- `other`
