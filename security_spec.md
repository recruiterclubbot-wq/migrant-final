# Security Specification — MIGRANT Platform

## 1. Data Invariants
1. **Vacancies**: Publicly readable (`get`, `list`), but ONLY verified admins can create, update, or delete vacancies. `createdBy` must equal `request.auth.uid` on creation and remain immutable.
2. **Users (PII Isolation)**: `/users/{userId}` holds PII (`email`, `phone`, `fullName`). Only the document owner (`request.auth.uid == userId`) or a verified admin (`isAdmin()`) may `get` it. Only verified admins may `list` all users.
3. **Privilege Escalation Prevention**: A user creating `/users/{userId}` CANNOT set `role: 'admin'` or `status: 'blocked'`. Only `role in ['candidate', 'employer']` and `status == 'active'` are permitted on self-registration. Owners CANNOT mutate `role`, `status`, `uid`, `email`, or `createdAt` on update.
4. **Admins Registry**: `/admins/{userId}` can only be listed, created, updated, or deleted by an existing verified admin (`isAdmin()`). Bootstrapped admin (`otzyvtyt@gmail.com` with `email_verified == true`) is recognized as admin.
5. **Applications**: Authenticated users can create applications ONLY with `userId == request.auth.uid` and `status == 'new'`. Users can only read/list their own applications (`resource.data.userId == request.auth.uid`). Only admins can update `status` or `adminNote`, or delete applications.
6. **Public Leads**: Unauthenticated visitors may `create` a lead in `/leads/{leadId}` ONLY with `status == 'new'`, `createdAt == request.time`, `updatedAt == request.time`, and strict field bounds (`hasOnly`). Public users CANNOT `get`, `list`, `update`, or `delete` `/leads` (preventing PII scraping).

## 2. Dirty Dozen Payloads (Must All Return PERMISSION_DENIED)
1. **Unauthenticated Vacancy Write**: Guest `create` on `/vacancies/v1` -> DENIED.
2. **Non-Admin Vacancy Delete**: Signed-in `candidate` `delete` on `/vacancies/v1` -> DENIED.
3. **Self-Assigned Admin Role**: Signed-in user `create` on `/users/{uid}` with `role: 'admin'` -> DENIED.
4. **Role Escalation Update**: Signed-in user `update` on `/users/{uid}` changing `role` from `'candidate'` to `'admin'` -> DENIED.
5. **PII Cross-Read**: Signed-in user A `get` on `/users/{userB}` -> DENIED.
6. **PII Collection Scrape**: Signed-in non-admin user `list` on `/users` -> DENIED.
7. **Admin Registry Poisoning**: Non-admin user `create` on `/admins/{uid}` -> DENIED.
8. **Spoofed Email Admin**: Unverified email token (`email_verified: false`) attempting admin write -> DENIED.
9. **Shadow Field Injection on Lead**: Guest `create` on `/leads/l1` including extra field `isVerified: true` -> DENIED.
10. **Lead Pre-Approved Bypass**: Guest `create` on `/leads/l1` with `status: 'approved'` -> DENIED.
11. **Lead PII Scraping**: Guest or non-admin signed-in user `list` or `get` on `/leads` -> DENIED.
12. **Path ID Poisoning**: Creating `/vacancies/` with oversized or special-char ID (`bad/../../id` or 200-char string) -> DENIED.
