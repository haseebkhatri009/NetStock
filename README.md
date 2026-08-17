# NetStock — Inventory, Delivery Challan, Invoice & Warranty ERP

React + Firebase (Auth + Realtime Database) se bana hua ek chota ERP: customers, category-wise
stock, delivery challan, invoice, MAC-address warranty validator, aur company ke liye multiple
user logins.

## 1. Firebase project setup

1. https://console.firebase.google.com par jaakar naya project banayein.
2. **Build → Authentication → Get started → Sign-in method** me **Email/Password** enable karein.
3. **Build → Realtime Database → Create Database** (Firestore nahi, Realtime Database).
   - Koi bhi region select kar sakte hain. Start karte waqt "locked mode" chunein.
4. Database ban jaane ke baad **Rules** tab me is repo ki `database.rules.json` file ka content
   paste karke **Publish** karein. (Ye demo-level rules hain: company ka data sirf usi company ke
   logged-in users padh/likh sakte hain.)
5. **Project settings (gear icon) → General → Your apps → Web app (</>)** se naya web app add
   karein aur uska `firebaseConfig` object copy karein.

## 2. Project setup

```bash
npm install
cp .env.example .env
```

`.env` file kholein aur apne Firebase config ki values daalein:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=...      # e.g. https://your-project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Phir app run karein:

```bash
npm run dev
```

Browser me `http://localhost:5173` khulega.

## 3. App kaise use karein

1. **Sign up** page se company ka naam, email aur password dekar account banayein — ye pehla user
   company ka **owner** ban jayega.
2. Login hone ke baad **Dashboard** khulega jahan customers, stock, DC/Invoice ke stats aur graphs
   dikhte hain.
3. **Customers** page: naya customer add karein (name, company, phone, address, description).
4. **Inventory** page: "Add Stock" se product add karein — category dropdown me IP Phone, UCM,
   Camera, Access Point + "Custom" option hai. MAC address aur serial number optional hain. Agar
   MAC diya jaye to wo item unique/serialized treat hota hai (quantity 1); agar MAC na diya jaye
   to bulk quantity de sakte hain. Stock list category-wise filter/search ho sakti hai.
5. **Delivery Challan**: customer select karein, stock se products add karein (jo customer ko de
   rahe hain) — submit karte hi wo stock se automatically deduct ho jata hai, current date apne
   aap lag jati hai, aur ek printable DC generate hoti hai.
6. **Invoice**: customer select karein, phir sirf product **name/model, quantity aur price** dekar
   items add karein — total khud calculate hota hai. Invoice **stock/inventory se linked nahi hai**
   (koi deduction nahi hota, MAC bhi nahi hota) — isse sirf billing document ke tor par use karein.
7. **Warranty Validator**: kisi bhi device ka MAC address dalein — system uski stock-entry date,
   agar bik chuka hai to customer ka naam, sale date aur warranty (default 12 months, ye
   `src/utils/helpers.js` ke `WARRANTY_MONTHS` se badal sakte hain) active/expired dikhata hai.
8. **Create User**: company ka owner is page se apni team ke liye naye email/password logins bana
   sakta hai — wo naya user login karke usi company ka data dekh sakega (customers, stock,
   challans, invoices sab shared hote hain, kyunke sab `companies/{companyId}/...` ke neeche
   store hota hai).

## 4. Data structure (Realtime Database)

```
users/{uid}                → { email, companyId, role, createdAt }
companies/{companyId}/
  profile                  → { name, ownerUid, createdAt }
  team/{uid}                → { email, role, createdAt }
  customers/{id}            → { name, company, phone, address, description, createdAt }
  stock/{id}                 → { category, name, mac, serial, description, quantity,
                                  status, addedDate, soldTo, soldDate, dcNumber, createdAt }
  challans/{id}               → { dcNumber, date, customerId, customerName, companyName,
                                    items:[{stockId,name,category,mac,serial,qty}], createdAt }
  invoices/{id}                → { invoiceNumber, date, customerId, customerName, companyName,
                                    items:[{name, qty, price}], total, createdAt }
                                  (invoice items are free-text — not linked to stock, no deduction)
```

## 5. Production ke liye notes

- `database.rules.json` demo-level hai; production me isse aur strict banayein (e.g. role-based
  writes, field validation).
- Passwords Firebase Authentication khud securely handle karta hai — app code me kahin bhi
  password store nahi hota.
- "Create User" feature ek **secondary Firebase Auth instance** use karta hai taake naya user
  banate waqt current admin ka session disturb na ho.
