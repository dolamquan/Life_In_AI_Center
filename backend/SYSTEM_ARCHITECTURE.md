Student
   ↓
Frontend Chat UI
   ↓
Backend API
   ↓
Tutor Controller
   ↓
Mode Router
   ├── Document-Grounded Mode
   │       ↓
   │   Retrieve document chunks from vector DB
   │       ↓
   │   Generate source-based answer
   │
   └── Hybrid Mode
           ↓
       Retrieve document chunks first
           ↓
       Use LLM knowledge to expand carefully