# Backend API Reference - Asset Management

## API Endpoints Summary

### 1. GET /api/assets - Get All Assets
**Request**: `GET http://localhost:5000/api/assets`

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "name": "Laptop",
    "description": "Dell XPS 13",
    "model": "XPS 13",
    "value": 1200.00,
    "categoryId": 1,
    "category": {
      "id": 1,
      "name": "Electronics"
    }
  }
]
```

---

### 2. GET /api/assets/{id} - Get Single Asset
**Request**: `GET http://localhost:5000/api/assets/1`

**Response** (200 OK):
```json
{
  "id": 1,
  "name": "Laptop",
  "description": "Dell XPS 13",
  "model": "XPS 13",
  "value": 1200.00,
  "categoryId": 1,
  "category": {
    "id": 1,
    "name": "Electronics"
  }
}
```

**Response** (404 Not Found):
```json
{
  "statusCode": 404,
  "message": "Asset not found"
}
```

---

### 3. POST /api/assets - Create New Asset
**Request**: `POST http://localhost:5000/api/assets`

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "name": "Monitor",
  "description": "4K Display",
  "model": "UltraWide 34",
  "value": 600.00,
  "categoryId": 1
}
```

**Response** (201 Created):
```json
{
  "id": 4,
  "name": "Monitor",
  "description": "4K Display",
  "model": "UltraWide 34",
  "value": 600.00,
  "categoryId": 1,
  "category": {
    "id": 1,
    "name": "Electronics"
  }
}
```

---

### 4. PUT /api/assets/{id} - Update Asset
**Request**: `PUT http://localhost:5000/api/assets/1`

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "id": 1,
  "name": "Laptop Pro",
  "description": "Updated Dell XPS 13",
  "model": "XPS 13 Plus",
  "value": 1500.00,
  "categoryId": 1
}
```

**Response** (204 No Content) or (200 OK with updated asset):
```json
{
  "id": 1,
  "name": "Laptop Pro",
  "description": "Updated Dell XPS 13",
  "model": "XPS 13 Plus",
  "value": 1500.00,
  "categoryId": 1,
  "category": {
    "id": 1,
    "name": "Electronics"
  }
}
```

**Response** (400 Bad Request):
```json
{
  "statusCode": 400,
  "message": "Invalid asset data"
}
```

---

### 5. DELETE /api/assets/{id} - Delete Asset
**Request**: `DELETE http://localhost:5000/api/assets/1`

**Response** (204 No Content):
```
(empty body)
```

**Response** (404 Not Found):
```json
{
  "statusCode": 404,
  "message": "Asset not found"
}
```

---

### 6. GET /api/categories - Get All Categories
**Request**: `GET http://localhost:5000/api/categories`

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "name": "Electronics"
  },
  {
    "id": 2,
    "name": "Furniture"
  },
  {
    "id": 3,
    "name": "Vehicles"
  }
]
```

---

## Asset Model (C# Backend)

```csharp
public class Asset 
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }
    
    [Required, StringLength(100)]
    public required string Name { get; set; }

    [StringLength(500)]
    public string? Description { get; set; }

    [Required, StringLength(50)]
    public required string Model { get; set; }

    [Range(0, double.MaxValue)]
    public decimal Value { get; set; }
    
    [Required]
    public int CategoryId { get; set; }

    [JsonIgnore]  // Prevents circular reference serialization
    public Category Category { get; set; } = null!; 
}

public class Category 
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; } 

    [Required, StringLength(100)] 
    public required string Name { get; set; }

    [JsonIgnore]  // Prevents circular reference serialization
    public ICollection<Asset> Assets { get; } = new HashSet<Asset>(); 
}
```

---

## Database

### Database Type
SQLite (File-based: `asset_db.sqlite`)

### Connection String
```
Data Source=asset_db.sqlite
```

### Tables

#### Assets Table
```sql
CREATE TABLE "Assets" (
    "Id" INTEGER NOT NULL CONSTRAINT "PK_Assets" PRIMARY KEY,
    "Name" VARCHAR(100) NOT NULL,
    "Description" VARCHAR(500),
    "Model" VARCHAR(50) NOT NULL,
    "Value" DECIMAL(65,30) NOT NULL,
    "CategoryId" INTEGER NOT NULL,
    CONSTRAINT "FK_Assets_Categories_CategoryId" FOREIGN KEY ("CategoryId") 
        REFERENCES "Categories" ("Id") ON DELETE RESTRICT
);
```

#### Categories Table
```sql
CREATE TABLE "Categories" (
    "Id" INTEGER NOT NULL CONSTRAINT "PK_Categories" PRIMARY KEY,
    "Name" VARCHAR(100) NOT NULL
);
```

### Sample Data
```sql
-- Categories
INSERT INTO Categories (Id, Name) VALUES (1, 'Electronics');
INSERT INTO Categories (Id, Name) VALUES (2, 'Furniture');
INSERT INTO Categories (Id, Name) VALUES (3, 'Vehicles');

-- Assets
INSERT INTO Assets (Id, Name, Description, Model, Value, CategoryId) 
VALUES (1, 'Laptop', 'Dell XPS 13', 'XPS 13', 1200.00, 1);

INSERT INTO Assets (Id, Name, Description, Model, Value, CategoryId) 
VALUES (2, 'Chair', 'Office chair', 'Ergonomic', 150.00, 2);

INSERT INTO Assets (Id, Name, Description, Model, Value, CategoryId) 
VALUES (3, 'Car', 'Toyota Corolla', 'Corolla', 15000.00, 3);
```

---

## Error Responses

### Common Error Status Codes

#### 400 Bad Request
Invalid input data
```json
{
  "statusCode": 400,
  "message": "Bad Request",
  "detail": "Asset name is required"
}
```

#### 404 Not Found
Resource doesn't exist
```json
{
  "statusCode": 404,
  "message": "Not Found",
  "detail": "Asset with ID 999 not found"
}
```

#### 500 Internal Server Error
Server error
```json
{
  "statusCode": 500,
  "message": "Internal Server Error",
  "detail": "An unexpected error occurred"
}
```

---

## CORS Configuration

The backend is configured to allow CORS requests from:
- `http://localhost:4200` (Angular development server)
- Origin: `*` (all origins in development)

**Allowed Methods**: GET, POST, PUT, DELETE, OPTIONS
**Allowed Headers**: Content-Type, Authorization

---

## Backend Server Status

**Server**: http://localhost:5000

To check if the server is running:
```bash
curl http://localhost:5000/swagger/index.html
```

**Swagger Documentation**: http://localhost:5000/swagger/index.html

---

## Testing with cURL

### Get All Assets
```bash
curl http://localhost:5000/api/assets
```

### Get Asset by ID
```bash
curl http://localhost:5000/api/assets/1
```

### Create Asset
```bash
curl -X POST http://localhost:5000/api/assets \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Monitor",
    "description": "4K Display",
    "model": "UltraWide 34",
    "value": 600.00,
    "categoryId": 1
  }'
```

### Update Asset
```bash
curl -X PUT http://localhost:5000/api/assets/1 \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "name": "Updated Laptop",
    "description": "Dell XPS 13",
    "model": "XPS 13",
    "value": 1500.00,
    "categoryId": 1
  }'
```

### Delete Asset
```bash
curl -X DELETE http://localhost:5000/api/assets/1
```

### Get Categories
```bash
curl http://localhost:5000/api/categories
```

---

## Response Headers

All responses include:
```
Content-Type: application/json
Access-Control-Allow-Origin: *
```

---

## Request/Response Flow Diagram

```
Frontend (Angular)
    ↓
HTTP Request
    ↓
CORS Middleware
    ↓
Controller (AssetsController)
    ↓
Service Layer / Repository
    ↓
EF Core DbContext
    ↓
SQLite Database
    ↓
(reverse flow for response)
    ↓
Frontend receives JSON
```

---

## Notes on Circular Reference

The backend includes `[JsonIgnore]` attributes on:
- `Asset.Category` navigation property
- `Category.Assets` collection

This prevents infinite loops during JSON serialization:
```
✓ GOOD: Asset → Category.Name only
✗ BAD: Asset → Category → Assets → Asset → Category...
```

