# File Upload Support - Both Multipart and Base64

Your backend now supports both traditional file uploads (multipart/form-data) and JSON with base64 encoded files.

## Multipart Form Data (Traditional)

### Video Upload
```bash
curl -X POST http://localhost:3000/api/videos \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "video=@path/to/video.mp4"
```

### Person Creation with Image
```bash
curl -X POST http://localhost:3000/api/people \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "name=John Doe" \
  -F "image=@path/to/photo.jpg"
```

### User Profile Picture Update
```bash
curl -X PUT "http://localhost:3000/api/users?id=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "username=newname" \
  -F "profilePicture=@path/to/picture.jpg"
```

## JSON with Base64 (New Feature)

### Video Upload with Base64
```javascript
// Frontend JavaScript example
const fileInput = document.getElementById('videoFile');
const file = fileInput.files[0];

const reader = new FileReader();
reader.onload = async function(e) {
  const base64Data = e.target.result; // includes "data:video/mp4;base64," prefix

  const response = await fetch('/api/videos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_JWT_TOKEN'
    },
    body: JSON.stringify({
      fileData: base64Data,
      filename: file.name
    })
  });
};
reader.readAsDataURL(file);
```

### Person Creation with Base64 Image
```javascript
const response = await fetch('/api/people', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    name: "John Doe",
    fileData: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAAAAAAD...", // base64 image
    filename: "profile.jpg"
  })
});
```

### User Profile Picture Update with Base64
```javascript
const response = await fetch('/api/users?id=1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    username: "newname",
    fileData: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAAAAAAD...", // base64 image
    filename: "new-profile.jpg"
  })
});
```

## WebSocket Video Streaming with Base64

For real-time video streaming through WebSocket:

```javascript
const ws = new WebSocket('ws://localhost:3000/api/ws/video-track?personId=1', [], {
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
});

// Capture video frame from camera
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const video = document.getElementById('cameraVideo');

function sendFrame() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);

  const frameData = canvas.toDataURL('image/jpeg', 0.8);

  ws.send(JSON.stringify({
    type: 'video_frame',
    data: frameData.split(',')[1], // Remove data URL prefix
    timestamp: Date.now()
  }));
}

// Send frames at 10 FPS
setInterval(sendFrame, 100);
```

## Key Features

### Automatic Detection
The backend automatically detects whether you're sending:
- `multipart/form-data` (traditional file upload)
- `application/json` (with base64 data)

### Base64 Format Support
The system handles base64 data in multiple formats:
- With data URL prefix: `"data:image/jpeg;base64,/9j/4AAQ..."`
- Without prefix: `"/9j/4AAQ..."`
- Automatic file extension detection from MIME type

### Error Handling
Proper error responses for:
- Invalid base64 data
- Missing required fields
- Unsupported content types
- File validation failures

## Use Cases

### Traditional Form Uploads
- Web forms with file inputs
- Desktop applications
- Server-to-server file transfers

### Base64 JSON
- Single-page applications (SPAs)
- Mobile apps
- WebSocket real-time streaming
- API integrations where multipart is not supported
- When you need to include file data in JSON payloads
