## e) Testing and Test Results

### Testing Approaches
- **Manual Testing**: Conducted exploratory testing via the UI to validate features.
- **Unit Testing**: Used Django’s built-in testing framework for backend logic.
- **API Testing**: Validated all endpoints using Postman.

---

### Test Case Examples

| Feature               | Input                                 | Expected Output                                     | Result    |
|-----------------------|----------------------------------------|-----------------------------------------------------|-----------|
| **User Registration** | Valid email & password                 | Token generated, user created                       | ✅ Passed |
| **Booking Functionality** | Available rental ID, valid dates      | Booking created, listing status updated             | ✅ Passed |
| **Payment Confirmation** | Booking ID                            | Payment recorded, booking confirmed                 | ✅ Passed |

---

### Findings
- All major functionalities worked reliably under multiple test scenarios.
- Timeouts and input validations effectively prevented misuse.
- Booking double-confirmation logic successfully avoided duplicate entries.



