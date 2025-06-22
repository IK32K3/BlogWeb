# Settings Component - API Integration Guide

## Overview
Component này sử dụng API `updateProfile` để cập nhật thông tin người dùng. Các tính năng chính:

- Cập nhật thông tin profile (username, email, bio, website, location)
- Upload và cập nhật avatar
- Thay đổi mật khẩu
- Lưu cài đặt (settings)
- Xóa tài khoản

## API Endpoints Used

### 1. Update Profile
```typescript
PUT /api/users/me
Content-Type: multipart/form-data

// FormData fields:
- username: string
- email: string  
- description: string (bio)
- website: string
- location: string
- avatar: File (optional)
```

### 2. Change Password
```typescript
PUT /api/users/me/changePassword
Content-Type: application/json

{
  "current_password": string,
  "new_password": string
}
```

### 3. Save Settings
```typescript
POST /api/users/me/settings
Content-Type: application/json

{
  "settings": {
    "theme": "light" | "dark",
    "darkMode": boolean,
    "language": string,
    "betaFeatures": boolean,
    "lockComments": boolean,
    "blockedUsers": string
  }
}
```

### 4. Upload Avatar
```typescript
POST /api/users/me/avatar
Content-Type: multipart/form-data

// FormData fields:
- avatar: File
```

### 5. Delete Account
```typescript
DELETE /api/users/me
Content-Type: application/json

{
  "currentPassword": string
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

**Security Features:**
- Requires current password verification
- Deletes all related data (settings, etc.)
- Uses database transaction for data integrity
- Cannot be undone

## Key Features

### 1. FormData Handling
- Sử dụng FormData để upload file (avatar)
- Tự động validate file size và type
- Preview avatar trước khi upload

### 2. Change Detection
- Method `hasChanges()` kiểm tra xem có thay đổi nào không
- Nút Save bị disable khi không có thay đổi
- Backup initial state để có thể cancel changes

### 3. Error Handling
- Hiển thị error messages từ API
- Loading states cho tất cả operations
- Validation client-side trước khi gửi request

### 4. User Experience
- Loading spinners
- Success/error notifications với SweetAlert2
- Disable buttons khi đang loading
- Auto-reload profile sau khi save thành công

## Usage Example

```typescript
// Update profile with avatar
const formData = new FormData();
formData.append('username', 'newUsername');
formData.append('email', 'newemail@example.com');
formData.append('description', 'My bio');
formData.append('avatar', avatarFile);

this.usersService.updateProfile(formData).subscribe({
  next: (response) => {
    // Handle success
    this.authService.updateCurrentUser(response.data.user);
  },
  error: (error) => {
    // Handle error
    this.showSwal(error.error?.message, 'error');
  }
});
```

```typescript
// Delete account
this.usersService.deleteAccount(currentPassword).subscribe({
  next: (response) => {
    // Handle success - user account deleted
    this.authService.logout();
    this.router.navigate(['/login']);
  },
  error: (error) => {
    // Handle error
    this.showSwal(error.error?.message, 'error');
  }
});
```

## File Validation

### Avatar
- Max size: 1MB
- Types: image/* (JPG, PNG, GIF)
- Square format recommended

### Logo
- Max size: 2MB  
- Types: image/*

### Favicon
- Max size: 1MB
- Types: image/*

## Dependencies

- `@angular/common/http` - HTTP requests
- `sweetalert2` - Notifications
- `rxjs` - Reactive programming
- `@angular/forms` - Form handling 