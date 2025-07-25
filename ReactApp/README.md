# ReactApp

This is the frontend single-page application for the VaccinationProject, built with React, Webpack, and Babel.

## Architecture

```mermaid
graph TD
    A[src/index.js] --> B[ApplicationComponent (src/app/application.js)]
    B --> C[Route: "/"]
    B --> D[Route: "/login"]
    B --> E[Route: "/register"]
    B --> F[Route: "/dashboard"]
    B --> G[Route: "/appointments"]
    B --> H[Route: "/vaccines"]
    B --> I[Route: "* (NotFound)"]
    C --> J[HomeComponent]
    D --> K[LoginComponent]
    E --> L[RegisterComponent]
    F --> M[DashboardComponent]
    G --> N[AppointmentsComponent]
    H --> O[VaccinesComponent]
    I --> P[NotFoundComponent]
```

- `ApplicationComponent` (in `src/app/application.js`) is the main router.
- Each route renders a corresponding component.
- The `*` route handles unmatched paths (NotFound).

## Developer Workflow

```sh
npm install
npm start # (Webpack Dev Server at http://localhost:9090)
```

## Appointment Listing Logic

- Appointments are listed by status. If the appointment date is in the past, it is automatically rejected and shown as such in the UI.

---