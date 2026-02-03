# Firebase Storage Rules

This project keeps public downloads open, but restricts every write to
authenticated TT admins stored in the `admins` collection. Upload helpers such
as `uploadProductImage`, `uploadBenefitLogo`, `uploadReceipt`, and
`uploadTrackFile` assume the following storage layout:

- `products/` → product photos
- `benefits/` → partner logos and artwork
- `receipts/` → payment proofs sent by athletes
- `tracks/` → GPX files uploaded from the admin panel

Use the rule set below to enforce that structure:

```text
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Productos
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null &&
        firestore.exists(/databases/(default)/documents/admins/$(request.auth.uid));
    }

    // Beneficios y carreras
    match /benefits/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null &&
        firestore.exists(/databases/(default)/documents/admins/$(request.auth.uid));
    }

    // Comprobantes
    match /receipts/{receiptId} {
      allow create, get: if true;
      allow list, delete: if request.auth != null &&
        firestore.exists(/databases/(default)/documents/admins/$(request.auth.uid));
    }

    // Tracks GPX
    match /tracks/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null &&
        firestore.exists(/databases/(default)/documents/admins/$(request.auth.uid));
    }
  }
}
```

## Deployment

Store the snippet in `storage.rules` and run `firebase deploy --only storage`
from the repo root. If you edit rules directly in the console, make sure this
document stays in sync so future agents know the expected permissions.
