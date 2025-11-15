# LEHELP Database Schema Documentation

## Overview
This document describes the database schema for the LEHELP platform.

## Tables

### Users
Core user authentication and profile information.

**Columns:**
- `id` (UUID): Primary key
- `email` (VARCHAR): User email (unique, nullable for anonymous users)
- `password_hash` (VARCHAR): Hashed password
- `role` (VARCHAR): User role (client, lawyer, activist, admin)
- `display_name` (VARCHAR): Display name
- `anonymous` (BOOLEAN): Whether user is registered anonymously
- `organization` (VARCHAR): Associated organization
- `verified` (BOOLEAN): Account verification status
- `mfa_enabled` (BOOLEAN): Multi-factor authentication enabled
- `created_at`, `updated_at`, `last_login` (TIMESTAMP)
- `status` (VARCHAR): Account status (active, suspended, deleted)

### User Profiles
Extended user profile information.

**Columns:**
- `user_id` (UUID): Foreign key to users
- `bio` (TEXT): User biography
- `languages` (JSONB): Array of spoken languages
- `expertise` (JSONB): Areas of expertise (for lawyers)
- `location` (JSONB): Location information
- `timezone` (VARCHAR): User timezone
- `preferences` (JSONB): User preferences
- `privacy_settings` (JSONB): Privacy settings

### Lawyer Profiles
Specific information for lawyer accounts.

**Columns:**
- `user_id` (UUID): Foreign key to users
- `bar_number` (VARCHAR): Bar association number
- `bar_jurisdiction` (VARCHAR): Bar jurisdiction
- `specializations` (JSONB): Legal specializations
- `years_experience` (INTEGER): Years of experience
- `success_rate` (DECIMAL): Case success rate
- `current_workload` (INTEGER): Current number of cases
- `capacity` (INTEGER): Maximum case capacity
- `available_for_cases` (BOOLEAN): Currently accepting cases
- `pro_bono` (BOOLEAN): Offers pro bono services
- `verified` (BOOLEAN): Lawyer credentials verified

### Cases
Legal cases in the system.

**Columns:**
- `id` (UUID): Primary key
- `client_id` (UUID): Foreign key to users (client)
- `assigned_lawyer_id` (UUID): Foreign key to users (lawyer)
- `title` (VARCHAR): Case title
- `description` (TEXT): Case description
- `case_type` (VARCHAR): Type of case (asylum, refugee, etc.)
- `urgency` (VARCHAR): Urgency level (low, medium, high, critical)
- `status` (VARCHAR): Current case status
- `jurisdiction` (VARCHAR): Legal jurisdiction
- `location` (JSONB): Case location
- `anonymous` (BOOLEAN): Anonymous case
- `ai_classification` (JSONB): AI classification results
- `required_expertise` (JSONB): Required legal expertise
- `created_at`, `updated_at`, `closed_at` (TIMESTAMP)
- `outcome` (VARCHAR): Case outcome

### Case Events
Timeline of events in a case.

**Columns:**
- `id` (UUID): Primary key
- `case_id` (UUID): Foreign key to cases
- `event_type` (VARCHAR): Type of event
- `title` (VARCHAR): Event title
- `description` (TEXT): Event description
- `event_date` (TIMESTAMP): When event occurred
- `created_by` (UUID): User who created the event
- `metadata` (JSONB): Additional event data

### Documents
Files associated with cases.

**Columns:**
- `id` (UUID): Primary key
- `case_id` (UUID): Foreign key to cases
- `uploaded_by` (UUID): Foreign key to users
- `filename` (VARCHAR): Original filename
- `file_type` (VARCHAR): MIME type
- `file_size` (BIGINT): File size in bytes
- `storage_path` (TEXT): Path in object storage
- `encryption_key_id` (VARCHAR): Encryption key reference
- `document_type` (VARCHAR): Type of document
- `language` (VARCHAR): Document language
- `ai_analysis` (JSONB): AI analysis results
- `extracted_entities` (JSONB): Extracted entities
- `virus_scanned` (BOOLEAN): Virus scan completed
- `version` (INTEGER): Document version

### Messages
Encrypted messages between users.

**Columns:**
- `id` (UUID): Primary key
- `case_id` (UUID): Foreign key to cases
- `sender_id` (UUID): Foreign key to users
- `recipient_id` (UUID): Foreign key to users
- `encrypted_content` (TEXT): Encrypted message content
- `encryption_metadata` (JSONB): Encryption information
- `message_type` (VARCHAR): Type of message
- `read_at` (TIMESTAMP): When message was read
- `created_at` (TIMESTAMP): Message sent time

### Notifications
User notifications.

**Columns:**
- `id` (UUID): Primary key
- `user_id` (UUID): Foreign key to users
- `type` (VARCHAR): Notification type
- `title` (VARCHAR): Notification title
- `message` (TEXT): Notification message
- `data` (JSONB): Additional notification data
- `read` (BOOLEAN): Read status
- `created_at` (TIMESTAMP)

### Activity Logs
Audit trail of user actions.

**Columns:**
- `id` (UUID): Primary key
- `user_id` (UUID): Foreign key to users
- `action` (VARCHAR): Action performed
- `resource_type` (VARCHAR): Type of resource affected
- `resource_id` (UUID): ID of resource
- `ip_address` (INET): User IP address
- `user_agent` (TEXT): User agent string
- `metadata` (JSONB): Additional context
- `created_at` (TIMESTAMP)

### Case Assignments
Tracking of case-lawyer assignments.

**Columns:**
- `id` (UUID): Primary key
- `case_id` (UUID): Foreign key to cases
- `lawyer_id` (UUID): Foreign key to users
- `assigned_by` (UUID): Who made the assignment
- `match_score` (DECIMAL): AI match score
- `match_metadata` (JSONB): Match details
- `status` (VARCHAR): Assignment status
- `accepted_at`, `rejected_at` (TIMESTAMP)
- `rejection_reason` (TEXT)

## Indexes

Performance indexes are created on:
- User email and role
- Case client_id, lawyer_id, status
- Document case_id
- Message case_id, sender_id, recipient_id
- Notification user_id
- Activity log user_id and created_at

## Triggers

- `update_updated_at_column`: Automatically updates `updated_at` timestamp on row updates
