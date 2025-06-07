# Database Schema
## Table Name: BirdMedia

### Primary Keys:
- 'file_id' (Partition Key): Unique idenifier for each uploaded file

---

### Attributes:
| Field Name       | Type     | Description |
|------------------|----------|-------------|
| `file_id`        | String   | Unique ID (UUID) for each media file |
| `user_id`        | String   | Uploader’s ID |
| `user_email`     | String   | User's email |
| `file_name`      | String   | file name |
| `file_type`      | String   | Type of the file: "image", "video", or "audio" |
| `upload_time`    | String   | ISO8601 timestamp of upload |
| `s3_url`         | String   | Full S3 URL of the uploaded file |
| `thumbnail_url`  | String   | S3 URL for the thumbnail (if applicable) |
| `tags`           | Map      | Key-value pair of species and count (e.g., `{ "crow": 3 }`) |
| `tags_flat`      | List     | Flat list of tags for fast filtering (e.g., `["crow", "pigeon"]`) |
---

## Table Name: BirdUser

### Primary Keys:
- 'user_id' (Partition Key): Unique idenifier for each user

---

### Attributes:
| Field Name       | Type     | Description |
|------------------|----------|-------------|
| `user_id`        | String   | Uploader’s ID |
| `user_password`  | String   | User's password |
| `user_email`     | String   | User's email |