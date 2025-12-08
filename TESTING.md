# Testing Guide for SplitSmart

This document outlines how to test all features of SplitSmart.

## Manual Testing Checklist

### 1. Groups Management

#### Create Group
- [ ] Click "Create New Group" button
- [ ] Enter group name
- [ ] Verify group appears in dashboard
- [ ] Check group has 0 members initially

#### View Group
- [ ] Click on a group card
- [ ] Verify group details page loads
- [ ] Check members list is empty or shows correct members
- [ ] Verify "Add Member" button is visible

#### Update Group
- [ ] (Future feature - not yet implemented)

#### Delete Group
- [ ] Click "Delete Group" button
- [ ] Confirm deletion dialog appears
- [ ] Verify group is removed from dashboard
- [ ] Check all associated data is deleted (cascade)

### 2. Members Management

#### Add Member
- [ ] Click "Add Member" button
- [ ] Enter member name
- [ ] Verify member appears in members list
- [ ] Check member count updates

#### Remove Member
- [ ] Click "×" button next to member name
- [ ] Confirm deletion
- [ ] Verify member is removed
- [ ] Check member count updates

#### Edge Cases
- [ ] Try adding member with empty name (should show error)
- [ ] Try adding member with very long name
- [ ] Add multiple members quickly

### 3. Expenses - Manual Entry

#### Create Expense (Equal Split)
- [ ] Click "Add Expense" button
- [ ] Fill in description (e.g., "Groceries")
- [ ] Enter amount (e.g., 100.00)
- [ ] Select category (e.g., "Food")
- [ ] Choose date
- [ ] Select who paid
- [ ] Choose "Equal Split"
- [ ] Select members to split between
- [ ] Submit form
- [ ] Verify expense appears in list
- [ ] Check balances update correctly

#### Create Expense (Custom Split)
- [ ] Click "Add Expense" button
- [ ] Fill in basic details
- [ ] Choose "Custom Amounts"
- [ ] Enter custom amounts for each member
- [ ] Verify total equals expense amount
- [ ] Submit form
- [ ] Check expense is created correctly

#### View Expense Details
- [ ] Click on an expense card
- [ ] Verify all details are displayed
- [ ] Check split breakdown is correct
- [ ] Verify receipt image if present

#### Delete Expense
- [ ] Open expense details
- [ ] Click "Delete" button
- [ ] Confirm deletion
- [ ] Verify expense is removed
- [ ] Check balances recalculate

#### Edge Cases
- [ ] Try submitting with empty description (should fail)
- [ ] Try negative amount (should fail)
- [ ] Try custom split that doesn't equal total (should fail)
- [ ] Try expense with no members selected (should fail)

### 4. Receipt Scanning (AI Feature)

#### Upload Receipt
- [ ] Click "Add Expense"
- [ ] Switch to "Scan Receipt" tab
- [ ] Click upload or drag-drop image
- [ ] Verify preview appears
- [ ] Click "Scan Receipt with AI"
- [ ] Wait for processing (should show loading state)
- [ ] Verify extracted data appears in form
- [ ] Check merchant name is extracted
- [ ] Check total amount is extracted
- [ ] Check date is extracted
- [ ] Edit any incorrect data
- [ ] Submit expense

#### Receipt Types to Test
- [ ] Restaurant receipt
- [ ] Grocery store receipt
- [ ] Gas station receipt
- [ ] Online order receipt (screenshot)
- [ ] Handwritten receipt
- [ ] Receipt with poor image quality

#### Edge Cases
- [ ] Try uploading non-image file (should fail)
- [ ] Try very large image file
- [ ] Try receipt with no clear total
- [ ] Try receipt in different language

### 5. Balance Calculation

#### Verify Balances
- [ ] Create multiple expenses
- [ ] Check balance summary shows correct debts
- [ ] Verify debt simplification works
- [ ] Check "All Settled Up" message when balanced

#### Test Scenarios

**Scenario 1: Simple Split**
- Group: Alice, Bob
- Expense: $100 paid by Alice, split equally
- Expected: Bob owes Alice $50

**Scenario 2: Multiple Expenses**
- Group: Alice, Bob, Charlie
- Expense 1: $90 paid by Alice, split equally (each owes $30)
- Expense 2: $60 paid by Bob, split equally (each owes $20)
- Expected: Charlie owes Alice $10, Charlie owes Bob $20

**Scenario 3: Complex Simplification**
- Group: A, B, C
- Expense 1: $30 paid by A, split equally
- Expense 2: $30 paid by B, split equally
- Expense 3: $30 paid by C, split equally
- Expected: All settled up (everyone paid $30, everyone owes $30)

### 6. Settlements

#### Record Settlement
- [ ] Click "Settle Up" button
- [ ] Select a debt to settle
- [ ] Verify amount is pre-filled
- [ ] Add optional notes
- [ ] Submit settlement
- [ ] Check balances update immediately
- [ ] Verify debt is reduced or removed

#### Edge Cases
- [ ] Try settling more than owed
- [ ] Try settling with empty amount
- [ ] Record multiple settlements quickly

### 7. UI/UX Testing

#### Responsive Design
- [ ] Test on desktop (1920x1080)
- [ ] Test on tablet (768x1024)
- [ ] Test on mobile (375x667)
- [ ] Check all buttons are clickable
- [ ] Verify text is readable at all sizes

#### Loading States
- [ ] Check spinner appears when loading groups
- [ ] Verify loading state during expense creation
- [ ] Check loading state during receipt scan
- [ ] Verify loading state during settlement

#### Error Handling
- [ ] Disconnect internet and try actions
- [ ] Enter invalid data in forms
- [ ] Try accessing non-existent group
- [ ] Check error messages are user-friendly

#### Navigation
- [ ] Click "Back" buttons work correctly
- [ ] Browser back button works
- [ ] Direct URL access works
- [ ] 404 page for invalid routes

### 8. Performance Testing

#### Load Testing
- [ ] Create group with 10+ members
- [ ] Add 50+ expenses
- [ ] Check page load times
- [ ] Verify balance calculation speed
- [ ] Test with large receipt images

#### Browser Compatibility
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test in Edge

### 9. Data Integrity

#### Cascade Deletes
- [ ] Delete group with expenses
- [ ] Verify all expenses are deleted
- [ ] Verify all members are deleted
- [ ] Check settlements are deleted

#### Data Validation
- [ ] Try SQL injection in inputs
- [ ] Try XSS attacks in text fields
- [ ] Verify all inputs are sanitized

### 10. API Testing

Use Postman or Thunder Client to test:

#### Groups Endpoints
```
POST /api/groups
GET /api/groups
GET /api/groups/:id
PUT /api/groups/:id
DELETE /api/groups/:id
```

#### Members Endpoints
```
POST /api/groups/:groupId/members
DELETE /api/members/:id
```

#### Expenses Endpoints
```
POST /api/expenses
GET /api/expenses?groupId=:id
GET /api/expenses/:id
PUT /api/expenses/:id
DELETE /api/expenses/:id
POST /api/expenses/scan
```

#### Balances & Settlements
```
GET /api/balances/:groupId
POST /api/settlements
GET /api/settlements?groupId=:id
```

## Automated Testing (Future)

Consider adding:
- Unit tests with Jest
- Integration tests with Supertest
- E2E tests with Cypress or Playwright
- API tests with Postman collections

## Bug Reporting

When you find a bug, document:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Screenshots if applicable
5. Browser/device information
6. Console errors

## Test Data

Use these sample groups for testing:

**Roommates Group**
- Members: Alice, Bob, Charlie
- Expenses: Rent, Utilities, Groceries

**Trip to Vegas**
- Members: Dan, Eve, Frank, Grace
- Expenses: Hotel, Flights, Meals, Entertainment

**Office Lunch**
- Members: Team members
- Expenses: Daily lunch orders

## Success Criteria

All tests should pass before deployment:
- ✅ All CRUD operations work
- ✅ Balance calculations are accurate
- ✅ Receipt scanning extracts data correctly
- ✅ UI is responsive on all devices
- ✅ Error handling is graceful
- ✅ No console errors
- ✅ Performance is acceptable

Happy testing! 🧪
